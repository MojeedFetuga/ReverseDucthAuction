import { expect } from "chai";
import { ethers } from "hardhat";

describe("ReverseDutchAuction", function () {
  let auction, seller, buyer, other;
  const startPrice = ethers.parseEther("10");
  const reservePrice = ethers.parseEther("5");
  const priceDrop = ethers.parseEther("1");
  const duration = 600; // 10 minutes

  beforeEach(async function () {
    [seller, buyer, other] = await ethers.getSigners();

    const Auction = await ethers.getContractFactory("ReverseDutchAuction");
    auction = await Auction.deploy(
      ethers.ZeroAddress, // No ERC20 token needed
      startPrice,
      reservePrice,
      priceDrop,
      duration
    );
    await auction.waitForDeployment();
  });

  it("should decrease price over time", async function () {
    const initialPrice = await auction.getCurrentPrice();
    await ethers.provider.send("evm_increaseTime", [300]); // Fast forward 5 minutes
    await ethers.provider.send("evm_mine", []);
    const newPrice = await auction.getCurrentPrice();
    expect(newPrice).to.be.below(initialPrice);
  });

  it("should only allow one buyer to purchase", async function () {
    await buyer.sendTransaction({ to: auction.target, value: await auction.getCurrentPrice() });
    await expect(
      other.sendTransaction({ to: auction.target, value: await auction.getCurrentPrice() })
    ).to.be.revertedWith("Auction already ended");
  });

  it("should transfer funds correctly", async function () {
    const price = await auction.getCurrentPrice();
    const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
    
    await buyer.sendTransaction({ to: auction.target, value: price });
    
    const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
    expect(sellerBalanceAfter).to.be.above(sellerBalanceBefore);
  });

  it("should not allow purchase after auction ends", async function () {
    await ethers.provider.send("evm_increaseTime", [duration]); // Fast forward to auction end
    await ethers.provider.send("evm_mine", []);
    await expect(
      buyer.sendTransaction({ to: auction.target, value: await auction.getCurrentPrice() })
    ).to.be.reverted;
  });
});
