// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ArosCoinView} from "../src/representation/ArosCoinView.sol";

/// @dev Minimal forge test without forge-std (no install required for compile structure).
/// Run with: forge test (after forge is installed).
contract ArosCoinViewTest {
    function test_decimals() public {
        ArosCoinView v = new ArosCoinView(address(0xBEEF));
        require(v.decimals() == 9, "decimals");
        require(keccak256(bytes(v.symbol())) == keccak256(bytes("ARO-VIEW")), "symbol");
    }
}
