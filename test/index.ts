import { expect } from "chai";
import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

describe("ExcaliburToken", function () {
  let ExcaliburToken: ContractFactory;
  let owner: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress;
  let excaliburToken: Contract;

  const tokenName = "ExcaliburToken";
  const symbol = "ET";
  const decimals = 2;
  const totalSupply = 10000;

  before(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    ExcaliburToken = await ethers.getContractFactory("ExcaliburToken");
  });

  beforeEach(async () => {
    excaliburToken = await ExcaliburToken.deploy(tokenName, symbol, totalSupply);
    await excaliburToken.deployed();
  });

  describe("Deployment", function () {
    it("Has a name", async () => {
      expect(await excaliburToken.name()).to.equal(tokenName);
    });

    it("Has a symbol", async () => {
      expect(await excaliburToken.symbol()).to.equal(symbol);
    });

    it("Has 18 decimals", async () => {
      expect(await excaliburToken.decimals()).to.be.equal(decimals);
    });

    it("Should set the right owner", async () => {
      expect(await excaliburToken.owner()).to.equal(owner.address);
    });

    it("Deployment should assign the total supply of ET to the owner", async () => {
      const ownerBalance = await excaliburToken.balanceOf(owner.address);
      expect(await excaliburToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Ownership", function () {
    it("Non owner should not be able to transfer ownership", async () => {
      await expect(
        excaliburToken.connect(alice).transferOwnership(alice.address)
      ).to.be.revertedWith("Only owner can do this");
    });

    it("Owner can transfer ownership", async () => {
      await excaliburToken.transferOwnership(alice.address);
      expect(await excaliburToken.owner()).to.be.equal(alice.address);
    });
  });

  describe("Transactions", function () {
    it("Should transfer ET between accounts", async () => {
      // Transfer 200 ET from owner to alice
      await excaliburToken.transfer(
        alice.address,
        ethers.utils.parseUnits("200.0", decimals)
      );
      const aliceBalance = await excaliburToken.balanceOf(alice.address);
      expect(aliceBalance).to.equal(ethers.utils.parseUnits("200.0", decimals));

      // Transfer 100 ET from alice to bob
      await excaliburToken
        .connect(alice)
        .transfer(bob.address, ethers.utils.parseUnits("100.0", decimals));
      const bobBalance = await excaliburToken.balanceOf(bob.address);
      expect(bobBalance).to.equal(ethers.utils.parseUnits("100.0", decimals));
    });

    it("Should fail if sender doesn't have enough TE", async () => {
      // Trying to send 10 ET from alice (0 ET) to owner (1000 ET)
      await expect(
        excaliburToken
          .connect(alice)
          .transfer(owner.address, ethers.utils.parseUnits("10.0", decimals))
      ).to.be.revertedWith("Not enough tokens");

      // Owner balance shouldn't have changed
      const ownerBalance = await excaliburToken.balanceOf(owner.address);
      expect(await excaliburToken.balanceOf(owner.address)).to.equal(
        ownerBalance
      );
    });

    it("Can not transfer above the amount", async () => {
      await expect(
        excaliburToken.transfer(
          alice.address,
          ethers.utils.parseUnits("1001.0", decimals)
        )
      ).to.be.revertedWith("Not enough tokens");
    });

    it("Transfer should emit event", async () => {
      const from = owner.address;
      const to = alice.address;
      const amount = ethers.utils.parseUnits("10.0", decimals);

      await expect(excaliburToken.transfer(to, amount))
        .to.emit(excaliburToken, "Transfer")
        .withArgs(from, to, amount);
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await excaliburToken.balanceOf(owner.address);

      // Transfer 200 ET from owner to alice
      await excaliburToken.transfer(
        alice.address,
        ethers.utils.parseUnits("200.0", decimals)
      );
      // Transfer another 100 ET from owner to bob
      await excaliburToken.transfer(
        bob.address,
        ethers.utils.parseUnits("100.0", decimals)
      );

      // Check balances
      const finalOwnerBalance = await excaliburToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(
        initialOwnerBalance.sub(ethers.utils.parseUnits("300.0", decimals))
      );

      const aliceBalance = await excaliburToken.balanceOf(alice.address);
      expect(aliceBalance).to.equal(ethers.utils.parseUnits("200.0", decimals));

      const bobBalance = await excaliburToken.balanceOf(bob.address);
      expect(bobBalance).to.equal(ethers.utils.parseUnits("100.0", decimals));
    });
  });

  describe("Allowance", function () {
    it("Approve should emit event", async () => {
      const amount = ethers.utils.parseUnits("10.0", decimals);
      await expect(excaliburToken.approve(alice.address, amount))
        .to.emit(excaliburToken, "Approval")
        .withArgs(owner.address, alice.address, amount);
    });

    it("Allowance should change after token approve", async () => {
      await excaliburToken.approve(
        alice.address,
        ethers.utils.parseUnits("200.0", decimals)
      );
      const allowance = await excaliburToken.allowance(
        owner.address,
        alice.address
      );
      expect(allowance).to.be.equal(ethers.utils.parseUnits("200.0", decimals));
    });

    it("TransferFrom should emit event", async () => {
      const amount = ethers.utils.parseUnits("10.0", decimals);
      await excaliburToken.approve(alice.address, amount);
      await expect(
        excaliburToken
          .connect(alice)
          .transferFrom(owner.address, alice.address, amount)
      )
        .to.emit(excaliburToken, "Transfer")
        .withArgs(owner.address, alice.address, amount);
    });

    it("Can not TransferFrom above the approved amount", async () => {
      const amount = ethers.utils.parseUnits("10.0", decimals);
      const aboveAmount = ethers.utils.parseUnits("20.0", decimals);
      await excaliburToken.approve(alice.address, amount);
      await expect(
        excaliburToken
          .connect(alice)
          .transferFrom(owner.address, alice.address, aboveAmount)
      ).to.be.revertedWith("Not enough tokens");
    });

    it("Can not TransferFrom if owner does not have enough tokens", async () => {
      // Approve alice to use 10 tokens
      const amount = ethers.utils.parseUnits("10.0", decimals);
      await excaliburToken.approve(alice.address, amount);

      // Send most of owner tokens to bob
      await excaliburToken.transfer(
        bob.address,
        ethers.utils.parseUnits("995.0", decimals)
      );

      // Check that we can't transfer all amount (only 5 left)
      await expect(
        excaliburToken
          .connect(alice)
          .transferFrom(owner.address, alice.address, amount)
      ).to.be.revertedWith("Not enough tokens");
    });
  });

  describe("Burning", function () {
    it("Non owner should not be able to burn tokens", async () => {
      const burnAmount = ethers.utils.parseUnits("10.0", decimals);
      await expect(
        excaliburToken.connect(alice).burn(burnAmount)
      ).to.be.revertedWith("Only owner can do this");
    });

    it("Owner should be able to burn tokens", async () => {
      const burnAmount = ethers.utils.parseUnits("10.0", decimals);
      await expect(excaliburToken.burn(burnAmount))
        .to.emit(excaliburToken, "Transfer")
        .withArgs(owner.address, ethers.constants.AddressZero, burnAmount);
    });

    it("Token supply & balance should change after burning", async () => {
      const initialSupply = await excaliburToken.totalSupply();

      const burnAmount = ethers.utils.parseUnits("10.0", decimals);
      await excaliburToken.burn(burnAmount);

      const currentSupply = await excaliburToken.totalSupply();
      expect(currentSupply).to.equal(initialSupply.sub(burnAmount));

      const ownerBalance = await excaliburToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(initialSupply.sub(burnAmount));
    });

    it("Can not burn above total supply", async () => {
      const burnAmount = ethers.utils.parseUnits("1050.0", decimals);
      await expect(excaliburToken.burn(burnAmount)).to.be.revertedWith(
        "Not enough tokens to burn"
      );
    });
  });

  describe("Minting", function () {
    it("Non owner should not be able to mint tokens", async () => {
      const mintAmount = ethers.utils.parseUnits("10.0", decimals);
      await expect(
        excaliburToken.connect(alice).mint(alice.address, mintAmount)
      ).to.be.revertedWith("Only owner can do this");
    });

    it("Owner should be able to mint tokens", async () => {
      const mintAmount = ethers.utils.parseUnits("10.0", decimals);
      await expect(excaliburToken.mint(owner.address, mintAmount))
        .to.emit(excaliburToken, "Transfer")
        .withArgs(ethers.constants.AddressZero, owner.address, mintAmount);
    });

    it("Token supply & balance should change after minting", async () => {
      const initialSupply = await excaliburToken.totalSupply();

      const mintAmount = ethers.utils.parseUnits("10.0", decimals);
      await excaliburToken.mint(owner.address, mintAmount);

      const currentSupply = await excaliburToken.totalSupply();
      expect(currentSupply).to.equal(initialSupply.add(mintAmount));

      const ownerBalance = await excaliburToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(initialSupply.add(mintAmount));
    });
  });
});