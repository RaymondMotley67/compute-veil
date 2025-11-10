import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { ComputeVeil, ComputeVeil__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ComputeVeil")) as ComputeVeil__factory;
  const computeVeilContract = (await factory.deploy()) as ComputeVeil;
  const computeVeilContractAddress = await computeVeilContract.getAddress();

  return { computeVeilContract, computeVeilContractAddress };
}

describe("ComputeVeil", function () {
  let signers: Signers;
  let computeVeilContract: ComputeVeil;
  let computeVeilContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ computeVeilContract, computeVeilContractAddress } = await deployFixture());
  });

  it("should deploy with correct initial state", async function () {
    const encryptedCount = await computeVeilContract.getCount();
    const owner = await computeVeilContract.owner();
    const isPaused = await computeVeilContract.isPaused();
    const protocolId = await computeVeilContract.protocolId();

    expect(encryptedCount).to.eq(ethers.ZeroHash);
    expect(owner).to.eq(signers.deployer.address);
    expect(isPaused).to.eq(false);
    expect(protocolId).to.eq(1);
  });

  it("should increment the counter by 1", async function () {
    const encryptedCountBeforeInc = await computeVeilContract.getCount();
    expect(encryptedCountBeforeInc).to.eq(ethers.ZeroHash);
    const clearCountBeforeInc = 0;

    // Encrypt constant 1 as a euint32
    const clearOne = 1;
    const encryptedOne = await fhevm
      .createEncryptedInput(computeVeilContractAddress, signers.alice.address)
      .add32(clearOne)
      .encrypt();

    const tx = await computeVeilContract
      .connect(signers.alice)
      .increment(encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();

    const encryptedCountAfterInc = await computeVeilContract.getCount();
    const clearCountAfterInc = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCountAfterInc,
      computeVeilContractAddress,
      signers.alice,
    );

    expect(clearCountAfterInc).to.eq(clearCountBeforeInc + clearOne);
  });

  it("should decrement the counter by 1", async function () {
    // Encrypt constant 1 as a euint32
    const clearOne = 1;
    const encryptedOne = await fhevm
      .createEncryptedInput(computeVeilContractAddress, signers.alice.address)
      .add32(clearOne)
      .encrypt();

    // First increment by 1, count becomes 1
    let tx = await computeVeilContract
      .connect(signers.alice)
      .increment(encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();

    // Then decrement by 1, count goes back to 0
    tx = await computeVeilContract.connect(signers.alice).decrement(encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();

    const encryptedCountAfterDec = await computeVeilContract.getCount();
    const clearCountAfterDec = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCountAfterDec,
      computeVeilContractAddress,
      signers.alice,
    );

    expect(clearCountAfterDec).to.eq(0);
  });

  it("should allow owner to pause and unpause", async function () {
    // Pause the contract
    let tx = await computeVeilContract.connect(signers.deployer).setPaused(true);
    await tx.wait();

    let isPaused = await computeVeilContract.isPaused();
    expect(isPaused).to.eq(true);

    // Try to increment while paused (should fail)
    const clearOne = 1;
    const encryptedOne = await fhevm
      .createEncryptedInput(computeVeilContractAddress, signers.alice.address)
      .add32(clearOne)
      .encrypt();

    await expect(
      computeVeilContract.connect(signers.alice).increment(encryptedOne.handles[0], encryptedOne.inputProof)
    ).to.be.revertedWithCustomError(computeVeilContract, "ContractPaused");

    // Unpause the contract
    tx = await computeVeilContract.connect(signers.deployer).setPaused(false);
    await tx.wait();

    isPaused = await computeVeilContract.isPaused();
    expect(isPaused).to.eq(false);

    // Now increment should work
    tx = await computeVeilContract.connect(signers.alice).increment(encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();

    const encryptedCount = await computeVeilContract.getCount();
    expect(encryptedCount).to.not.eq(ethers.ZeroHash);
  });

  it("should prevent non-owner from pausing", async function () {
    await expect(
      computeVeilContract.connect(signers.alice).setPaused(true)
    ).to.be.revertedWithCustomError(computeVeilContract, "NotOwner");
  });

  it("should allow ownership transfer", async function () {
    const tx = await computeVeilContract.connect(signers.deployer).transferOwnership(signers.alice.address);
    await tx.wait();

    const newOwner = await computeVeilContract.owner();
    expect(newOwner).to.eq(signers.alice.address);

    // Old owner should not be able to pause anymore
    await expect(
      computeVeilContract.connect(signers.deployer).setPaused(true)
    ).to.be.revertedWithCustomError(computeVeilContract, "NotOwner");

    // New owner should be able to pause
    const pauseTx = await computeVeilContract.connect(signers.alice).setPaused(true);
    await pauseTx.wait();

    const isPaused = await computeVeilContract.isPaused();
    expect(isPaused).to.eq(true);
  });

  it("should check user permissions", async function () {
    // Initially, alice should not have permission
    let hasPermission = await computeVeilContract.hasPermission(signers.alice.address);
    expect(hasPermission).to.eq(false);

    // After alice increments, she should have permission
    const clearOne = 1;
    const encryptedOne = await fhevm
      .createEncryptedInput(computeVeilContractAddress, signers.alice.address)
      .add32(clearOne)
      .encrypt();

    const tx = await computeVeilContract
      .connect(signers.alice)
      .increment(encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();

    hasPermission = await computeVeilContract.hasPermission(signers.alice.address);
    expect(hasPermission).to.eq(true);

    // Bob should still not have permission
    const bobHasPermission = await computeVeilContract.hasPermission(signers.bob.address);
    expect(bobHasPermission).to.eq(false);
  });
});
