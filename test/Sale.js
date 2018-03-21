var Sale = artifacts.require('DemoSale.sol');
var Token = artifacts.require('DemoToken.sol');

const tests = require("@daonomic/tests-common");
const awaitEvent = tests.awaitEvent;
const expectThrow = tests.expectThrow;
const randomAddress = tests.randomAddress;

contract("Sale", accounts => {
  let token;

  beforeEach(async function() {
    token = await Token.new();
  });

  function bn(value) {
    return new web3.BigNumber(value);
  }

  async function setOperator(sale) {
    await sale.transferRole("operator", accounts[9]);
  }

  async function allow(sale, address) {
    await setOperator(sale);
    await sale.setWhitelist(address, true, {from: accounts[9]});
  }

  it("should sell tokens for ether", async () => {
    var sale = await Sale.new(token.address, 100, 1000000);
    await allow(sale, accounts[1]);
    await token.transferOwnership(sale.address);

    await sale.sendTransaction({from: accounts[1], value: 99});
    assert.equal(await token.totalSupply(), 100000);
    assert.equal(await token.balanceOf(accounts[1]), 100000);
  });

  it("should not sell tokens if not in whitelist", async () => {
    var sale = await Sale.new(token.address, 100, 1000000);
    await token.transferOwnership(sale.address);

    await expectThrow(
        sale.sendTransaction({from: accounts[1], value: 99})
    );
  });

  it("should sell tokens for btc", async () => {
    var sale = await Sale.new(token.address, accounts[5], bn("1000000000000000000000000"));
    await allow(sale, accounts[1]);
    await token.transferOwnership(sale.address);

	await sale.onTokenTransfer(0, bn("99000000"), accounts[1], {from: accounts[5]});
    assert(bn("11000000000000000000000").equals(await token.totalSupply()));
    assert(bn("11000000000000000000000").equals(await token.balanceOf(accounts[1])));
  });

  it("should change eth/btc rate", async () => {
    var sale = await Sale.new(token.address, accounts[5], bn("1000000000000000000000000"));
    await allow(sale, accounts[1]);
    await token.transferOwnership(sale.address);

	await sale.setBtcEthRate(bn("50000000000"));
	await sale.onTokenTransfer(0, bn("99000000"), accounts[1], {from: accounts[5]});
    assert(bn("5500000000000000000000").equals(await token.totalSupply()));
    assert(bn("5500000000000000000000").equals(await token.balanceOf(accounts[1])));
  });

  it("should transfer token ownership", async () => {
    var sale = await Sale.new(token.address, 100, 1000000);
    await allow(sale, accounts[1]);
    await token.transferOwnership(sale.address);

	await expectThrow(
      token.mint(randomAddress(), 100)
	);
	await expectThrow(
	  token.mint(accounts[3], 100, {from: accounts[1]})
	);
	await sale.transferTokenOwnership(accounts[1]);
	await token.mint(accounts[3], 100, {from: accounts[1]});
	assert.equal(await token.balanceOf(accounts[3]), 100);
  });

  it("should throw if cap reached", async () => {
    var sale = await Sale.new(token.address, 100, 1500);
    await allow(sale, accounts[1]);
    await token.transferOwnership(sale.address);

	await expectThrow(
	  sale.sendTransaction({from: accounts[1], value: 2})
	);
    await sale.sendTransaction({from: accounts[1], value: 1});
	await expectThrow(
	  sale.sendTransaction({from: accounts[1], value: 1})
	);
  });

  it("should calculate bonus correctly", async () => {
    async function testBonus(sold, testBonus) {
        var sale = await Sale.new(token.address, 100, 1000000);
        var result = await sale.getBonus(sold);
        assert(testBonus.equals(result), testBonus.toNumber() + " != " + result.toNumber());
    }

	await testBonus(bn("100000000000000000000"), bn("0"));
    await testBonus(bn("1000000000000000000000"), bn("50000000000000000000"));
    await testBonus(bn("100000000000000000000000"), bn("10000000000000000000000"));
    await testBonus(bn("350000000000000000000000"), bn("70000000000000000000000"));
    await testBonus(bn("1000000000000000000000000"), bn("330000000000000000000000"));
  });

  it("should sell to users from whitelist", async () => {
    var sale = await Sale.new(token.address, 100, 1000000000);
    await setOperator(sale);
    await sale.setWhitelist(accounts[1], true, {from: accounts[9]});

    await token.transferOwnership(sale.address);

    await expectThrow(
        sale.sendTransaction({from: accounts[2], value: 99})
    );

    await sale.sendTransaction({from: accounts[1], value: 99});
    assert.equal(await token.totalSupply(), 100000);
    assert.equal(await token.balanceOf(accounts[1]), 100000);
  });

  it("should transfer tokens sold some other way (no bonus)", async () => {
    var sale = await Sale.new(token.address, 100, 1000000);
    await token.transferOwnership(sale.address);

	var address = randomAddress();
    await sale.transfer(address, 1000);

    assert.equal((await token.totalSupply()).toNumber(), 1000);
    assert.equal((await token.balanceOf(address)).toNumber(), 1000);
    assert.equal(await sale.cap(), 1000000 - 1000);
    assert.equal(await sale.isInWhitelist(address), true);
  });

  it("should emulate purchase", async () => {
    var sale = await Sale.new(token.address, 100, 1000000);
    await token.transferOwnership(sale.address);

	var address = randomAddress();
    await sale.emulatePurchase(address, 0, 10, 100, 100);

    assert.equal((await token.totalSupply()).toNumber(), 200);
    assert.equal((await token.balanceOf(address)).toNumber(), 200);
    assert.equal(await sale.cap(), 1000000 - 200);
    assert.equal(await sale.isInWhitelist(address), true);
  });

});
