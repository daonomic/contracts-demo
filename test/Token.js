var Token = artifacts.require('DemoToken.sol');

const tests = require("@daonomic/tests-common");
const awaitEvent = tests.awaitEvent;
const expectThrow = tests.expectThrow;
const randomAddress = tests.randomAddress;

contract("Token", accounts => {
  let token;

  beforeEach(async function() {
    token = await Token.new();
  });

  function bn(value) {
    return new web3.BigNumber(value);
  }

  it("should be enabled after create", async () => {
    assert.equal(await token.paused(), false);
  });

  it("should mint tokens", async () => {
    var address = randomAddress();
    await token.mint(address, 100);
    assert.equal(await token.balanceOf(address), 100);
  });

  it("should mint tokens even if paused", async () => {
    await token.pause();

    var address = randomAddress();
    await token.mint(address, 100);
    assert.equal(await token.balanceOf(address), 100);
  });

  it("should not let transfer when paused", async () => {
    await token.pause();

    await token.mint(accounts[1], 100);
    assert.equal(await token.balanceOf(accounts[1]), 100);

    await expectThrow(
      token.transfer(accounts[2], 50, {from: accounts[1]})
    );
  });

  it("should let transfer when active", async () => {
    await token.mint(accounts[1], 100);
    assert.equal(await token.balanceOf(accounts[1]), 100);

	await token.transfer(accounts[2], 50, {from: accounts[1]});
	assert.equal(await token.balanceOf(accounts[1]), 50);
	assert.equal(await token.balanceOf(accounts[2]), 50);
  });

  it("should let burn tokens", async () => {
    await token.mint(accounts[1], 100);
    assert.equal(await token.balanceOf(accounts[1]), 100);
    assert.equal(await token.totalSupply(), 100);

	await token.burn(20, {from: accounts[1]});
	assert.equal(await token.balanceOf(accounts[1]), 80);
	assert.equal(await token.totalSupply(), 80);
  });

  it("should not let burn more than you have", async () => {
    await token.mint(accounts[1], 100);
	await expectThrow(
		token.burn(101, {from: accounts[1]})
	);
  });

});
