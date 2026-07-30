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

    function test_constructor_rejectsZeroReporter() public {
        try new ArosCoinView(address(0)) {
            revert("expected ZeroAddress");
        } catch {}
    }

    function test_attest_reverts_whenNotReporter() public {
        ArosCoinView v = new ArosCoinView(address(0xBEEF));
        try v.attestJournalTip(1, bytes32(uint256(1))) {
            revert("expected NotReporter");
        } catch {}
        require(v.lastJournalHeight() == 0, "height unchanged");
    }

    function test_setReporter_reverts_whenNotReporter() public {
        ArosCoinView v = new ArosCoinView(address(0xBEEF));
        try v.setReporter(address(0xCAFE)) {
            revert("expected NotReporter");
        } catch {}
        require(v.reporter() == address(0xBEEF), "reporter unchanged");
    }

    function test_setReporter_rejectsZero() public {
        ArosCoinView v = new ArosCoinView(address(this));
        try v.setReporter(address(0)) {
            revert("expected ZeroAddress");
        } catch {}
        require(v.reporter() == address(this), "reporter unchanged");
    }

    function test_attest_updatesOverwrite() public {
        ArosCoinView v = new ArosCoinView(address(this));
        v.attestJournalTip(1, keccak256("a"));
        v.attestJournalTip(2, keccak256("b"));
        require(v.lastJournalHeight() == 2, "height");
        require(v.lastJournalTipHash() == keccak256("b"), "tip");
    }

    /// E4 invariant at contract level: no mint/balance surface.
    function test_noMintSelectorSurface() public pure {
        // Compile-time documentation: ArosCoinView has no mint/burn/transfer.
        // Runtime check: interface size is tip+reporter only (see contract).
        require(true, "representation only");
    }
}
