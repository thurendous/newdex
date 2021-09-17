const Dai = artifacts.require("Dai");
const Link = artifacts.require("Link");
const Comp = artifacts.require("Comp");
const Dex = artifacts.require("Dex");

const toWei = (number) => web3.utils.toWei(web3.utils.toBN(number), "ether");

const BN = require("bn.js");

const chai = require("chai");
const { expect } = chai;
chai.use(require("chai-bn")(BN));

const truffleAssert = require("truffle-assertions");

contract("ERC20 token test ", (accounts) => {
  let dai, link, comp;

  const owner = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];

  before(async () => {
    dai = await Dai.deployed();
    link = await Link.deployed();
    comp = await Comp.deployed();
    dex = await Dex.deployed();
  });

  describe("Supply", () => {
    //   before
    it("should return  token  names and symbols correctly", async () => {
      expect(await dai.name()).to.equal("Dai");
      expect(await link.symbol()).to.equal("LINK");
      expect(await comp.name()).to.equal("Compound");
    });
    // after
    it("Owner should have all the tokens", async () => {
      //   console.log(new BN(1) == new BN(1)); false
      //dai
      expect(await dai.balanceOf(owner)).to.be.bignumber.equal(toWei(10 ** 10));
      expect(await dai.balanceOf(alice)).to.bignumber.equal(toWei(0));
      expect(await dai.balanceOf(bob)).to.bignumber.equal(toWei(0));
      // link
      expect(await link.balanceOf(owner)).to.bignumber.equal(toWei(10 ** 6));
      expect(await link.balanceOf(alice)).to.bignumber.equal(toWei(0));
      expect(await link.balanceOf(bob)).to.bignumber.equal(toWei(0));
      // comp
      expect(await comp.balanceOf(owner)).to.bignumber.equal(toWei(10 ** 4));
      expect(await comp.balanceOf(alice)).to.bignumber.equal(toWei(0));
      expect(await comp.balanceOf(bob)).to.bignumber.equal(toWei(0));
    });
  });
  it("Total supply should be right!", async () => {
    expect(await dai.totalSupply()).to.bignumber.equal(toWei(10 ** 10));
    expect(await link.totalSupply()).to.bignumber.equal(toWei(10 ** 6));
    expect(await comp.totalSupply()).to.bignumber.equal(toWei(10 ** 4));
  });
  it("should revert when transfer amount > balance", async () => {
    const ownerBalance = await comp.balanceOf(owner);
    const transferAmount = ownerBalance.add(new BN(1));
    await truffleAssert.reverts(comp.transfer(alice, transferAmount));
  });

  describe("transfer() test", () => {
    it("should pass when  transfer amount <= balance", async () => {
      const transferAmount = web3.utils.toBN(1000);
      await truffleAssert.passes(comp.transfer(alice, transferAmount));
    });
  });

  describe("transferFrom() test", () => {
    before(async () => {
      const approveAmount = web3.utils.toBN(500);
      await comp.approve(bob, approveAmount, { from: alice });
    });

    it("should pass when transfer amount <= allowance", async () => {
      const approveAmount = await comp.allowance(alice, bob);
      await truffleAssert.passes(
        comp.transferFrom(alice, bob, approveAmount, { from: bob })
      );
    });
    it("should revert when transfer amount > allowance", async () => {
      const transferAmount = web3.utils.toBN(501);
      await truffleAssert.reverts(
        comp.transferFrom(alice, bob, transferAmount, { from: bob })
      );
    });
  });
});
