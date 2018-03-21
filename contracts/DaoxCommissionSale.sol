pragma solidity ^0.4.0;

import "@daonomic/sale/contracts/AbstractSale.sol";

contract DaoxCommissionSale is AbstractSale {
	function getSold(address _token, uint256 _value) constant public returns (uint256) {
		return super.getSold(_token, _value).div(99).mul(100);
	}
}
