// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ArosCoinView} from "../src/representation/ArosCoinView.sol";

/**
 * @dev Deploy without forge-std Script base (portable).
 * Prefer CLI (see docs/contracts/DEPLOY-TESTNET-E2.md):
 *
 *   forge create src/representation/ArosCoinView.sol:ArosCoinView \
 *     --constructor-args $REPORTER \
 *     --rpc-url $RPC_URL --private-key $DEPLOYER_PK --broadcast
 *
 * Or: npm run contracts:deploy -- --reporter 0x...
 */
contract DeployArosCoinView {
    function deploy(address reporter) external returns (ArosCoinView v) {
        v = new ArosCoinView(reporter);
    }
}
