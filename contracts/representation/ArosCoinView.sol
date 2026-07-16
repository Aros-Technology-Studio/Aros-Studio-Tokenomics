// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArosCoinView
 * @notice Representation-oriented ERC-20-like surface for external compatibility.
 * @dev NOT AST source of truth. Canonical mint/burn/transfer only after PoT + NodeChain
 *      in the TypeScript core. This contract must not invent unconfirmed emission or custody.
 *
 *      Compatible with AST Token Protocol §VI (Representation Adapters only).
 */
contract ArosCoinView {
    string public constant name = "ArosCoin Representation";
    string public constant symbol = "ARO";
    uint8 public constant decimals = 9;

    /// @dev Mirror supply — set only by authorized bridge/adapter role off canonical process.
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    address public adapterAdmin;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event MirrorSync(address indexed account, uint256 balance, uint256 totalSupply);

    error NotAdapterAdmin();
    error FreeMintForbidden();

    modifier onlyAdapterAdmin() {
        if (msg.sender != adapterAdmin) revert NotAdapterAdmin();
        _;
    }

    constructor(address admin_) {
        adapterAdmin = admin_;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /**
     * @notice Sync mirrored balances from off-chain canonical state (adapter).
     * @dev Does not authorize economic creation without prior NodeChain+PoT off-chain.
     */
    function mirrorSync(address account, uint256 balance, uint256 newTotalSupply)
        external
        onlyAdapterAdmin
    {
        _balances[account] = balance;
        _totalSupply = newTotalSupply;
        emit MirrorSync(account, balance, newTotalSupply);
    }

    /// @dev Public mint path reverts — emission only after PoT + NodeChain off-chain.
    function mint(address, uint256) external pure {
        revert FreeMintForbidden();
    }
}
