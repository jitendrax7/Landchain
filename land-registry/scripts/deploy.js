const { ethers } = require("hardhat");

async function main() {
  const LandRegistry = await ethers.getContractFactory("Bhumichain");
  const contract = await LandRegistry.deploy();

  await contract.waitForDeployment(); // correct replacement for deployed()

  console.log("Contract deployed at:", contract.target); // ethers v6 syntax
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
