const hre = require("hardhat");
const { ethers } = require("ethers"); // Import ethers directly

async function getBalances(address) {
  const balanceBigInt = await hre.ethers.provider.getBalance(address);
  return ethers.formatEther(balanceBigInt); // Use ethers.formatEther directly
}

async function printBalances(addresses) {
  let counter = 0;
  for (const address of addresses) {
    const balance = await getBalances(address);
    console.log(`Address ${counter} balance: ${balance} ETH`);
    counter++;
  }
}

async function consoleMemos(memos) {
  for (const memo of memos) {
    const timeStamp = Number(memo.timestamp); // Convert BigInt to Number
    console.log(
      `At: ${new Date(timeStamp * 1000).toLocaleString()},  name: ${
        memo.name
      },    address: ${memo.from},  message: ${memo.message}`
    );
  }
}

async function main() {
  // Get signers
  const [owner, from1, from2, from3] = await hre.ethers.getSigners();

  // Deploy the contract
  const Chai = await hre.ethers.getContractFactory("chai");
  const contract = await Chai.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`Address of contract: ${contractAddress}`);

  const addresses = [
    owner.address,
    from1.address,
    from2.address,
    from3.address,
  ];

  console.log("Before buying chai");
  await printBalances(addresses);

  // Interacting with the contract
  const amount = { value: hre.ethers.parseEther("5") };

  await contract.connect(from1).buyChai("from1", "Comment 1", amount);
  await contract.connect(from2).buyChai("from2", "Comment 2", amount);
  await contract.connect(from3).buyChai("from3", "Comment 3", amount);

  console.log("After buying chai");
  await printBalances(addresses);

  // Get memos and display them
  const memos = await contract.getMemos();
  consoleMemos(memos);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
