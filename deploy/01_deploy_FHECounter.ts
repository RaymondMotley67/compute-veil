import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async () => {};
export default func;
func.id = "noop_FHECounter_deploy";
func.tags = ["FHECounter", "noop"];
func.skip = async () => true;

