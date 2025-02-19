import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contract with account: ${deployer.address}`);

  // Define parameters
  const tokenAddress = ethers.ZeroAddress; // No ERC20 token needed
  const startPrice = ethers.parseEther("10"); // Example: 10 ETH
  const reservePrice = ethers.parseEther("5"); // Example: 5 ETH
  const priceDrop = ethers.parseEther("1"); // 1 ETH drop per interval
  const duration = 600; // 10 minutes

  // Deploy contract
  const Auction = await ethers.getContractFactory("ReverseDutchAuction");
  const auction = await Auction.deploy(tokenAddress, startPrice, reservePrice, priceDrop, duration);

  await auction.waitForDeployment();
  console.log(`ReverseDutchAuction deployed to: ${auction.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
