pragma solidity ^0.4.18;

import "@daonomic/tokens/contracts/BurnableTokenImpl.sol";
import "@daonomic/tokens/contracts/MintableTokenImpl.sol";
import "@daonomic/tokens/contracts/PausableToken.sol";
import "@daonomic/util/contracts/OwnableImpl.sol";

contract DemoToken is OwnableImpl, PausableToken, MintableTokenImpl, BurnableTokenImpl {
	string public constant name = "Daonomic Demo Token";
	string public constant symbol = "DEMO";
	uint8 public constant decimals = 18;

	function burn(uint256 _value) public whenNotPaused {
		super.burn(_value);
	}
}