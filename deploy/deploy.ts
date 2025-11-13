import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const network = hre.network.name;

  console.log(`Deploying to network: ${network}`);
  
  const deployedFHECounter = await deploy("FHECounter", {
    from: deployer,
    log: true,
    args: [], // Constructor arguments if any
  });

  console.log(`FHECounter contract deployed to: `, deployedFHECounter.address);
  console.log(`Network: ${network}, Deployer: ${deployer}`);
};
export default func;
func.id = "deploy_fheCounter"; // id required to prevent reexecution
func.tags = ["FHECounter"];
