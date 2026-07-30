// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ArosCoinView} from "../src/representation/ArosCoinView.sol";

/// @dev Minimal forge tests without forge-std (self-contained).
/// Run: forge test --root contracts  |  npm run test:contracts
contract ArosCoinViewTest {
    function test_metadata() public {
        ArosCoinView v = new ArosCoinView(address(0xBEEF));
        require(v.decimals() == 9, "decimals");
        require(keccak256(bytes(v.symbol())) == keccak256(bytes("ARO-VIEW")), "symbol");
        require(
            keccak256(bytes(v.name())) == keccak256(bytes("ArosCoin Representation")),
            "name"
        );
        require(v.reporter() == address(0xBEEF), "reporter");
    }

    function test_attestJournalTip_onlyReporter() public {
        ArosCoinView v = new ArosCoinView(address(this));
        bytes32 tip = keccak256("tip-1");
        v.attestJournalTip(7, tip);
        require(v.lastJournalHeight() == 7, "height");
        require(v.lastJournalTipHash() == tip, "tip");
    }

    function test_setReporter() public {
        ArosCoinView v = new ArosCoinView(address(this));
        v.setReporter(address(0xCAFE));
        require(v.reporter() == address(0xCAFE), "next reporter");
    }
}
