pragma solidity ^0.4.18;

import "@daonomic/sale/contracts/MintingSale.sol";
import "@daonomic/util/contracts/OwnableImpl.sol";
import "@daonomic/sale/contracts/CappedBonusSale.sol";
import "@daonomic/util/contracts/SecuredImpl.sol";
import "@daonomic/sale/contracts/WhitelistSale.sol";
import "@daonomic/sale/contracts/PeriodSale.sol";
import "./DaoxCommissionSale.sol";
import "./DemoToken.sol";

contract DemoSale is OwnableImpl, SecuredImpl, DaoxCommissionSale, MintingSale, CappedBonusSale, WhitelistSale, PeriodSale {
	address public btcToken;
	uint256 public ethRate = 1000 * 10**18;
	uint256 public btcEthRate = 10 * 10**10;

	function DemoSale(
		address _mintableToken,
		address _btcToken,
		uint256 _start,
		uint256 _end,
		uint256 _cap)
	PeriodSale(_start, _end)
	MintingSale(_mintableToken)
	CappedBonusSale(_cap) {
		btcToken = _btcToken;
		RateAdd(address(0));
		RateAdd(_btcToken);
	}

	function getRate(address _token) constant public returns (uint256) {
		if (_token == btcToken) {
			return btcEthRate * ethRate;
		} else if (_token == address(0)) {
			return ethRate;
		} else {
			return 0;
		}
	}

	function getBonus(uint256 sold) constant public returns (uint256) {
		if (sold > 1000000 * 10**18) {
			return sold.mul(50).div(100);
		} else if (sold > 500000 * 10**18) {
			return sold.mul(33).div(100);
		} else if (sold > 100000 * 10**18) {
			return sold.mul(20).div(100);
		} else if (sold > 1000 * 10**18) {
			return sold.mul(10).div(100);
		} else if (sold > 100 * 10**18) {
			return sold.mul(5).div(100);
		} else {
			return 0;
		}
	}

	event EthRateChange(uint256 rate);

	function setEthRate(uint256 _ethRate) onlyOwner public {
		ethRate = _ethRate;
		EthRateChange(_ethRate);
	}

	event BtcEthRateChange(uint256 rate);

	function setBtcEthRate(uint256 _btcEthRate) onlyOwner public {
		btcEthRate = _btcEthRate;
		BtcEthRateChange(_btcEthRate);
	}

	function withdrawBtc(bytes _to, uint256 _value) onlyOwner public {
		burnWithData(btcToken, _value, _to);
	}

	function transferTokenOwnership(address newOwner) onlyOwner public {
		OwnableImpl(token).transferOwnership(newOwner);
	}

	function pauseToken() onlyOwner public {
		Pausable(token).pause();
	}

	function unpauseToken() onlyOwner public {
		Pausable(token).unpause();
	}

	function transfer(address beneficiary, uint256 amount) onlyOwner public {
		emulatePurchase(beneficiary, address(1), 0, amount, 0);
	}

	function emulatePurchase(address beneficiary, address paymentMethod, uint256 value, uint256 amount, uint256 bonus) onlyOwner public {
		setWhitelistInternal(beneficiary, true);
		doPurchase(beneficiary, amount, bonus);
		Purchase(beneficiary, paymentMethod, value, amount, bonus);
		onPurchase(beneficiary, paymentMethod, value, amount, bonus);
	}
}
