import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedComputeVeil = await deploy("ComputeVeil", {
    from: deployer,
    log: true,
  });

  console.log(`ComputeVeil contract: `, deployedComputeVeil.address);
};
export default func;
func.id = "deploy_computeVeil"; // id required to prevent reexecution
func.tags = ["ComputeVeil"];
