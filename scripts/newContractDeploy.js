const hre = require("hardhat");

async function main() {
  const Chai = await hre.ethers.getContractFactory("chaiContract");
  const contract = await Chai.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`Address of contract: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
