
import { expect } from "chai";
import { ethers } from "hardhat";

import type { MyToken__factory, MyToken } from "../typechain-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("MyToken Contract", function () {
  let MyToken: MyToken__factory;
  let myToken: MyToken;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  let initialSupply = ethers.parseUnits("1000", 18);

  beforeEach(async function () {
    MyToken = await ethers.getContractFactory("MyToken");

    [owner, addr1, addr2] = await ethers.getSigners();

    myToken = await MyToken.deploy(initialSupply);
    await myToken.waitForDeployment();
  });

  it("Should deploy the contract and set the initial supply correctly", async function () {
    expect(await myToken.name()).to.equal("DemoToken");
    expect(await myToken.symbol()).to.equal("DTK");
    expect(await myToken.balanceOf(await owner.getAddress())).to.equal(initialSupply);
  });

  it("Should allow token transfers between accounts", async function () {
    await myToken.transfer(addr1.address, ethers.parseUnits("100", 18));

    expect(await myToken.balanceOf(addr1.address)).to.equal(ethers.parseUnits("100", 18));
    expect(await myToken.balanceOf(owner.address)).to.equal(initialSupply - ethers.parseUnits("100", 18));
  });

  it("Should emit Transfer event on transfer", async function () {
    await expect(myToken.transfer(addr1.address, ethers.parseUnits("100", 18)))
      .to.emit(myToken, "Transfer")
      .withArgs(owner.address, addr1.address, ethers.parseUnits("100", 18));
  });

  it("Should fail if sender does not have enough balance", async function () {
    await expect(myToken.connect(addr1).transfer(addr2.address, ethers.parseUnits("1", 18)))
      .to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance");
  });

  it("Should allow the owner to mint new tokens", async function () {
    await myToken.mint(owner.address, ethers.parseUnits("500", 18));

    expect(await myToken.balanceOf(owner.address)).to.equal(initialSupply + ethers.parseUnits("500", 18));
  });
});
