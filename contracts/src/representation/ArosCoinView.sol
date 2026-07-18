// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ArosCoinView
 * @notice Read-only representation surface. Canonical supply is NodeChain/PoT — not this contract.
 * @dev No privileged mint. Mirrors optional external view of AST process-bound facts.
 */
contract ArosCoinView {
    string public constant name = "ArosCoin Representation";
    string public constant symbol = "ARO-VIEW";
    uint8 public constant decimals = 9;

    /// @notice Last journal tip hash attested by an authorized reporter (off-chain process).
    bytes32 public lastJournalTipHash;
    uint256 public lastJournalHeight;

    address public reporter;

    event JournalAttested(uint256 height, bytes32 tipHash, address reporter);
    event ReporterUpdated(address previous, address next);

    error NotReporter();
    error ZeroAddress();

    constructor(address initialReporter) {
        if (initialReporter == address(0)) revert ZeroAddress();
        reporter = initialReporter;
    }

    function setReporter(address next) external {
        if (msg.sender != reporter) revert NotReporter();
        if (next == address(0)) revert ZeroAddress();
        address prev = reporter;
        reporter = next;
        emit ReporterUpdated(prev, next);
    }

    /// @notice Attest NodeChain tip for explorers — does not mint or change SoT.
    function attestJournalTip(uint256 height, bytes32 tipHash) external {
        if (msg.sender != reporter) revert NotReporter();
        lastJournalHeight = height;
        lastJournalTipHash = tipHash;
        emit JournalAttested(height, tipHash, msg.sender);
    }
}
