# MIGRATION_REVIEW.md

**STEP 1 — Canon-filter review of `AST-Aros-Financial-Paradigm` → `Aros-Studio-Tokenomics`.**  
**Nothing migrated. Nothing pushed to `main`. This is a review for Ketevan to confirm before STEP 2.**

- Source repo: `aros-technology-studio/ast-aros-financial-paradigm` @ `cdc33cd`
- Files reviewed: **483** (every tracked file, read by 13 directory-scoped classifiers, then an 8-agent adversarial re-audit of the 110 KEEP docs)
- **KEEP** (firewall-clean core, staged): **179**
- **CUT** (ALB epoch / debris / generated): **122**
- **REVIEW-KETEVAN** (a fork, a canon contradiction, or a load-bearing firewall term — you decide): **182**
- Re-audit + Ketevan's forbidden-vocabulary rule pulled **46** files back out of KEEP — 43 for staking / deposits / token-weighted governance / treasury-held supply / Eye-no-veto (section **M**), and 3 for 'reward'/'incentive' framing (section **N**).

Cleaned KEEP candidates are in **`review-staging/`** (paths preserved). Firewall gate over that folder is CLEAN: `grep -RInE 'AFC|Aros Financial Core|LacMusa|Fiat Anchor|Crypto Anchor'` returns nothing (the one `AFC` in `package-lock.json` is a base64 hash substring, not a reference).

---

## The decisions only you can make (these drive everything else)

These are the forks the whole migration hinges on. I did **not** resolve any of them.

**A. The 25% 'AFC reserve' split.** The commission model routes 75% to nodes and **25% to something literally named `AFC_RESERVE`** (constant `MARGIN_RECIPIENT='AFC_RESERVE'`, event `reserve.afc.accrual`, method `addAfcAccrual()`, var `afcShare`). This is woven through `src/commission`, `src/reserve`, `src/emission`, `reference/ast-core/src/commission.ts`, spec `AST_Commission/Emission/Reserve`, and `10/pot_tx_incentive_distribution.md`. **Is that 25% AST's OWN reserve (then we rename `AFC_*` → `RESERVE_*` and it's KEEP), or an external entity (then it's a firewall breach and the model changes)?** One word from you unlocks ~20 files.

**B. Does the All-Seeing-Eye have veto?** Your canon says it **HAS veto**. The entire codebase says the opposite — `src/all-seeing-eye/*`, `invariants.spec.ts` (I10), every spec's 'passive oversight' line, `AST_AllSeeingEye_AGENT_EN.md` ('strictly passive, NO veto'), and all of `13_extra_supervisory_layer` / `ast/extra_supervisory_layer` describe it as a passive witness that 'cannot act'. This is not an in-repo fork — it's the repo vs. your stated canon. **Confirm: veto or no veto?**

**C. Born-and-burned & no-held-supply vs. staking / pre-mine / governance-token.** This turned out to be the biggest systemic issue. Beyond genesis allocation and vesting, the adversarial re-audit found that **node participation runs on staking / security-deposits** (locked = held supply), the **entire `06_governance_layer` is token-weighted, stake-gated governance with a treasury that holds tokens**, `08_fee_distribution` mints splits into treasury/ecosystem/risk pools under governance-capped ceilings, and API/schemas expose `locked` balances + a hard `maxSupply` cap. All contradict 'ArosCoin is born-and-burned, emitted only via PoT; influence = work + reputation, not stake; supply is derived from process, not capped by governance.' **Confirm these are absolute** (then ~43 more files are cut/rewritten) or tell me the real supply/governance model. See section **M**.

**D. The 'team of roles that emit actions' model.** `12_nodechain_ai_agents/agent_roles_matrix.md` (+ the persona preamble 'As PR Director… as a role' in `CONTRIBUTING`/`CHANGELOG`/`CODE_OF_CONDUCT`/`glossary`, and `role:` labels in `AST_AGENT_TASKS.yaml`) is the CUT-epoch role model. The underlying Python anomaly-detection engine (`12/src/*.py`) is clean and KEEP. **Confirm the role-team model is cut** (the engine stays).

**E. `13_extra_supervisory_layer/` vs `ast/extra_supervisory_layer/` is a divergent FORK** (not a duplicate). Same for `aros-tokenomics/03_*` vs `03_token_management_layer/*`, and `07/tx_ttl_expiration.md` vs the Notion-export `tx_lifecycle_management.md`. **Pick which branch is canonical** in each case.

**F. Frontend & Solidity scope.** `frontend/**` is a real AST NodeChain dashboard (firewall-clean) — but is a UI in scope for the clean infra repo? And `smart_contracts/contracts/ArosCoinReserveManager.sol` mints on deposit / burns on withdrawal (custodial), which diverges from PoT-only emission. **Both are your scope calls.**

---

## REVIEW-KETEVAN — grouped by the decision behind it

### A. The 25% 'AFC reserve' fork — is that share AST's OWN reserve (rename) or an external entity? (load-bearing AFC in identifiers/events)
_17 file(s)_

- `01_coin_engine/aro_emission_protocol.md`
- `01_coin_engine/burn_and_mint_rules.md`
- `01_coin_engine/coin_emission_model.md`
- `01_coin_engine/coin_use_cases.md`
- `01_coin_engine/payment_distribution.md`
- `10_proof_of_transaction_engine/pot_tx_incentive_distribution.md`
- `docs/specs/AST_Commission_AGENT_EN.md`
- `docs/specs/AST_Emission_AGENT_EN.md`
- `docs/specs/AST_Reserve_AGENT_EN.md`
- `reference/ast-core/src/commission.ts`
- `src/commission/commission.module.ts`
- `src/commission/commission.service.ts`
- `src/commission/entities/epoch.entity.ts`
- `src/emission/emission.service.spec.ts`
- `src/emission/emission.service.ts`
- `src/reserve/reserve.service.spec.ts`
- `src/reserve/reserve.service.ts`

### B. All-Seeing-Eye: passive/no-veto CONTRADICTS canon (Eye HAS veto) + 13_ vs ast/ FORK
_21 file(s)_

- `13_extra_supervisory_layer/README.md`
- `13_extra_supervisory_layer/anomaly_detection_patterns.md`
- `13_extra_supervisory_layer/integrity_signal_emission.md`
- `13_extra_supervisory_layer/meta_event_logging_protocol.md`
- `13_extra_supervisory_layer/observation_scope_and_limits.md`
- `13_extra_supervisory_layer/observer_node_interface.md`
- `13_extra_supervisory_layer/the_all_seeing_eye_overview.md`
- `ast/extra_supervisory_layer/anomaly_detection_patterns.md`
- `ast/extra_supervisory_layer/integrity_signal_emission.md`
- `ast/extra_supervisory_layer/meta_event_logging_protocol.md`
- `ast/extra_supervisory_layer/observation_scope_and_limits.md`
- `ast/extra_supervisory_layer/observer_node_interface.md`
- `ast/extra_supervisory_layer/the_all_seeing_eye_overview.md`
- `docs/specs/AST_AllSeeingEye_AGENT_EN.md`
- `src/all-seeing-eye/all-seeing-eye.module.ts`
- `src/all-seeing-eye/all-seeing-eye.service.spec.ts`
- `src/all-seeing-eye/all-seeing-eye.service.ts`
- `src/all-seeing-eye/entities/oversight-log-entry.entity.ts`
- `src/invariants/invariants.spec.ts`
- `src/orchestrator/orchestrator.service.spec.ts`
- `src/orchestrator/orchestrator.service.ts`

### C. Born-and-burned VIOLATION — pre-mine / genesis / vesting / governance-mint / held-supply (contradicts PoT-only born-and-burned)
_14 file(s)_

- `01_coin_engine/AROS_Coin_TokenSpec.json`
- `01_coin_engine/burn_mechanism.md`
- `03_token_management_layer/aroscoin_supply_model.md`
- `03_token_management_layer/token_distribution_model.md`
- `03_token_management_layer/token_issuance_protocol.md`
- `03_token_management_layer/token_lock_unlock_rules.md`
- `03_token_management_layer/token_supply_governance.md`
- `04_aros_value_circulation/aroscoin_distribution_tiers.md`
- `04_aros_value_circulation/aroscoin_internal_flow.md`
- `04_aros_value_circulation/aroscoin_release_schedule.md`
- `04_aros_value_circulation/aroscoin_velocity_control.md`
- `04_aros_value_circulation/reserve_pool_policy.md`
- `04_aros_value_circulation/vault_system_design.md`
- `08_fee_distribution/emission_trigger_conditions.md`

### D. 'Team of roles that emit actions' org model (CUT-epoch model — flagged, not auto-cut)
_15 file(s)_

- `12_nodechain_ai_agents/README.md`
- `12_nodechain_ai_agents/agent_architecture.md`
- `12_nodechain_ai_agents/agent_roles_matrix.md`
- `12_nodechain_ai_agents/ai_governance_escalation.md`
- `12_nodechain_ai_agents/audit_trace_emitter.md`
- `12_nodechain_ai_agents/consensus_dispute_resolver.md`
- `12_nodechain_ai_agents/fraud_signal_dispatcher.md`
- `12_nodechain_ai_agents/meta_learning_feedback_loop.md`
- `12_nodechain_ai_agents/tx_pattern_recognition.md`
- `12_nodechain_ai_agents/validator_behavior_monitor.md`
- `AST_AGENT_TASKS.yaml`
- `CHANGELOG.md`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `glossary.md`

### E. AFC/ALB framing or old multi-epoch scope (define-by-relation to AFC, or ALB/BTC/ETH scope)
_16 file(s)_

- `.github/workflows/nightly-audit.yml`
- `06_governance_layer/governance_layer_overview.md`
- `README.md`
- `architecture_diagrams.md`
- `docs/AST_Developer_Deep_Dive.md`
- `docs/api/openapi.yaml`
- `docs/architecture/Architecture_Overview.md`
- `docs/architecture/Module_Map.md`
- `docs/architecture/sequence_diagrams.md`
- `docs/conceptual/AST_Whitepaper.md`
- `docs/glossary.md`
- `docs/requirements/SRS_AST.md`
- `docs/specs/AST_Ontology_FULL_AGENT_EN.md`
- `economic_simulation.md`
- `roadmap.md`
- `threat_model_global.md`

### F. Duplicate-fork (near-duplicate of 03_token_management_layer/*; pick ONE canonical)
_12 file(s)_

- `aros-tokenomics/03_token_management_layer/aroscoin_supply_model.md`
- `aros-tokenomics/03_token_management_layer/burn_mechanism.md`
- `aros-tokenomics/03_token_management_layer/contract_self_destruct_policy.md`
- `aros-tokenomics/03_token_management_layer/contract_upgrade_proxy.md`
- `aros-tokenomics/03_token_management_layer/contract_versioning_policy.md`
- `aros-tokenomics/03_token_management_layer/smart_contract_registry.md`
- `aros-tokenomics/03_token_management_layer/smart_contract_upgrade_policy.md`
- `aros-tokenomics/03_token_management_layer/token_audit_trail.md`
- `aros-tokenomics/03_token_management_layer/token_distribution_model.md`
- `aros-tokenomics/03_token_management_layer/token_issuance_protocol.md`
- `aros-tokenomics/03_token_management_layer/token_lock_unlock_rules.md`
- `aros-tokenomics/03_token_management_layer/token_supply_governance.md`

### F. Duplicate-fork (title mismatch / two near-identical bodies; pick ONE canonical)
_3 file(s)_

- `07_processing_layer/TX Validation & Safety.md`
- `07_processing_layer/tx_ttl_expiration md  250f1989022c80c0bc35da35a8324342/tx_lifecycle_management.md`
- `07_processing_layer/tx_ttl_expiration.md`

### G. Legal / patent (your domain; firewall hits — never auto-stripped)
_6 file(s)_

- `docs/legal/Legal & Compliance Commentary .md`
- `docs/legal/Legal Commentary on Asset Backing & Double Issuan.md`
- `docs/legal/Patent-Filing-Receipt.md`
- `docs/legal/Patent-Modular-Architecture-Summary.md`
- `docs/legal/Principles & Paradigm.md`
- `docs/legal/README.md`

### H. Solidity: owner mint-on-deposit / burn-on-withdrawal (custodial) vs canon PoT-only emission
_1 file(s)_

- `smart_contracts/contracts/ArosCoinReserveManager.sol`

### I. External-crypto/cross-chain bridge woven into core queue (contradicts self-sufficiency)
_1 file(s)_

- `07_processing_layer/tx_queue_handler.md`

### J. Rules file (spec-allowed to retain terms) — confirm 'role-based governance' != persona model
_1 file(s)_

- `AST_RULES.yaml`

### K. Empty 0-byte stub (fill or drop — your call)
_8 file(s)_

- `docs/legal/Intellectual_Property.md`
- `docs/legal/Patent_References.md`
- `docs/security/GDPR_KVKK_Controls.md`
- `docs/security/ZeroTrust_Compliance.md`
- `docs/standards/Logging_Conventions.md`
- `docs/standards/Security_Policy.md`
- `docs/standards/ZeroTrust_Compliance.md`
- `docs/testing/Test_Coverage_Map.md`

### L. Frontend dashboard — is a UI in scope for the clean AST infra repo? (your scope call)
_21 file(s)_

- `frontend/.gitignore`
- `frontend/README.md`
- `frontend/eslint.config.js`
- `frontend/index.html`
- `frontend/package.json`
- `frontend/public/vite.svg`
- `frontend/src/App.css`
- `frontend/src/App.tsx`
- `frontend/src/assets/react.svg`
- `frontend/src/components/GovernancePanel.tsx`
- `frontend/src/components/LedgerFeed.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/components/NodeList.tsx`
- `frontend/src/components/Overview.tsx`
- `frontend/src/hooks/useData.ts`
- `frontend/src/index.css`
- `frontend/src/main.tsx`
- `frontend/tsconfig.app.json`
- `frontend/tsconfig.json`
- `frontend/tsconfig.node.json`
- `frontend/vite.config.ts`

### M. Adversarial re-audit — held-supply / staking / token-weighted governance / Eye-no-veto (no literal firewall term; missed by the per-directory first pass)
_43 file(s)_

These 43 files were classified KEEP by the first pass (no firewall term) but the adversarial re-audit found conceptual Model-A contamination. The re-audit recommended **CUT** for 7 of them (marked ⛔); I still routed those to REVIEW because cutting staking / governance / deposits forever is a model decision for you, not mine.

- `01_coin_engine/AST Node Infrastructure Specification.md` — Affirmative validator staking / security deposit ('Validator node must stake minimum X ARO'; §4 'Registration and Security Deposit'), stake slashing ('Malicious tampering → Stake slashing & blacklist'), and governance-vote enforcement (Governance Node 'Participates in voting'; 'Collusion behavior → governance vote'). Locked/staked ArosCoin is held circulating supply / lockup (born-and-burned violation); slashing-against-stake and governance voting are prohibited Model-A constructs, used affirmatively (not inside a prohibition).
- `02_nodechain_engine/node_registration_and_auth.md` — Affirmative 'Integrity staking: optional escrow for trust-sensitive roles' plus validator 'Security Deposit & audit' as a live registration step in the onboarding flowchart (not a prohibition). Locked escrow/deposit = held circulating supply / lockup, a born-and-burned violation contradicting the no-staking canon.
- `02_nodechain_engine/nodechain_security_model.md` — 'Entry into the network is gated via staking and cryptographic challenge' (§2.1) and Sybil resistance 'via Cryptographic staking' (§4) use staking affirmatively as a network-entry gate = held/locked ArosCoin (lockup / held circulating supply), a born-and-burned violation of the no-staking canon.
- `03_token_management_layer/README.md` — Emission described as NOT PoT-gated: 'enforces rules for minting, burning, and locking tokens based on on-chain activity and governance decisions' = governance-vote minting + token locking. 'Supply Governance: Controls parameters like hard caps and emission ratios' = supply capped by governance, directly contradicting the canon invariant that supply is derived from confirmed PoT process and not capped by governance.
- `03_token_management_layer/burn_mechanism.md` — Contains velocity-throttle-of-held-supply and a supply cap: overflow burn triggers on 'velocity_of_token < minimum_velocity_threshold' and 'total_supply > target_ceiling' (Max total supply 1,000,000,000 ARO). Also a price/value-appreciation narrative: 'More burn -> Less total supply -> Potentially higher value per ARO.' Burn is fee-percentage based, not the born-and-burned process part. These are price-stability / velocity-throttle / governance-capped-supply concepts prohibited by canon.
- `03_token_management_layer/smart_contract_registry.md` — Registry enshrines prohibited contract types as first-class AST infrastructure: 'Vaults | Secure holding contracts for treasury & payments' = held/treasury circulating supply; 'SwapGate | Optional layer for token swaps' = swap/liquidity layer; 'NodeRegistry | Handles validator/staker roles' = staking. These describe held-treasury supply and a swap layer as part of the token infra, contradicting born-and-burned / no-held-supply canon.
- `06_governance_layer/README.md` — Describes the governance layer as token-weighted: 'Voting Execution: On-chain, token-weighted voting logic' and 'Governance Token Logic: Management of voting rights and delegation.' A governance token whose holdings/weight confer voting power is speculative hold-for-influence and contradicts canon (no speculative hold; node influence = work + reputation, governance is role-based not token-weighted).
- `06_governance_layer/governance_roles_and_permissions.md` — Core governance actions are gated on staked/held governance tokens: 'Voter | May vote on proposals with staked governance tokens' and 'Proposal Author | ... (with token stake).' Voting/proposing weighted by staked token holdings is held-circulating-supply / speculative-hold governance, contradicting canon role-based (work+reputation) governance. (Note: the 'Observer ... cannot act' row is a read-only governance role, NOT the All-Seeing Eye, so it is not an Eye-passivity violation.)
- `06_governance_layer/governance_token_logic.md` ⛔(re-audit: CUT) — Whole file defines a distinct staked, delegated governance token used for token-weighted voting, with a governance treasury that HOLDS tokens: 'Security Deposit-Based Voting: Governance power is activated only when tokens are staked'; stake()/unstake with cooldown lockups; 'Allocated by governance vote from payment pools' = governance-vote allocation/minting; 'Expired tokens are returned to the governance treasury' and 'Governance Treasury | Holds expired and unallocated tokens' = held circulating supply. The entire premise (a staked/treasury-held token-weighted governance token) is a cut-forever concept under canon (no token-weighted governance, no staking, no held/treasury supply).
- `06_governance_layer/proposal_submission_protocol.md` — Eligibility requires holding 'minimum governance token stake' (minProposalStake) and final submission 'burns a small amount of governance tokens' — presupposes a held/staked governance-token supply (held circulating supply / speculative hold, born-and-burned violation) and token-weighted governance. actionType 'fund_allocation' plus governance-vote parameter changes imply treasury allocation and governance control over funds. Conceptual contamination with no literal firewall term.
- `06_governance_layer/quorum_validation_rules.md` — Quorum is defined as participation 'by token weight' computed over 'total eligible staked tokens at snapshot' — token-weighted governance resting on a held/staked circulating supply (born-and-burned violation). Higher impact tiers gate 'financial reallocations' i.e. governance-controlled fund movement. Contradicts canon: supply derived from confirmed process, not capped/steered by governance.
- `06_governance_layer/voting_mechanism.md` — Load-bearing token-weighted, stake-locked governance: 'VotingWeight = stakedGovernanceTokens' and voting rights 'must be actively staked during the voting period.' This presupposes a held/staked circulating supply (born-and-burned violation: held circulating supply / speculative hold) and is the explicitly-banned token-weighted governance model, contradicting the canon's no-held-supply and role-based (not token-weighted) governance. No literal firewall term, but conceptual contamination.
- `08_fee_distribution/emission_flow_pipeline.md` — Emission mints a split to a treasury as load-bearing design: Stage 5 'Validator payment split (e.g., 60% to confirming node, 40% to treasury)', 'Governance treasury replenishment', and example distribution.treasury. Stage 4 mints AROS 'in a locked state' subject to 'time-lock, governance review'. This is held/treasury-allocated circulating supply plus lockups, and the pipeline never burns a process part (tokens go to validator+treasury and are marked 'spent') — violates born-and-burned atomicity and the no-held-supply invariant.
- `08_fee_distribution/emission_layer_api_interface.md` — Governance Override API is load-bearing: 'Allows supernodes to freeze, reinstate, or correct emissions', and POST /emission/override lets a governance entity 'correct a misfire, freeze emission, or retroactively revoke it' (authorized_by GOV). Governance authority to reinstate/revoke/freeze already-emitted supply contradicts born-and-burned atomicity and puts supply under governance control rather than confirmed process.
- `08_fee_distribution/emission_layer_overview.md` — States governance-controlled supply as a core principle: 'Deflation-aware Governance: Supply is bounded per epoch and regulated via emission ceilings' and 'Predictable supply: All emission volumes are pre-modelled and adjustable only by governance.' Governance-capped/adjusted supply directly contradicts the canon invariant that supply is derived from confirmed process and not capped by governance.
- `08_fee_distribution/emission_rollbacks_and_freeze_rules.md` — Contains a staking model ('Validator staking payments revoked'), token Soft/Hard Freeze that quarantines tokens and marks them 'non-transferable' (held/frozen circulating supply), and governance multi-sig vote to burn/rollback emission. Staking, frozen held supply, and governance-vote-controlled mint/burn all violate the no-hold / born-and-burned canon.
- `08_fee_distribution/epoch_allocation_model.md` — Defines governance-controlled supply caps (max_emission_cap, 'no bypass ... unless explicitly voted on via governance', 'adjustable ... governance consensus') and allocates each epoch's minted supply by role: Validator 60%, Governance pool 25%, Ecosystem reserve 10%, Risk buffer 5%. Minting into governance pool / ecosystem reserve / risk buffer is treasury/held-supply allocation, and a governance-capped emission ceiling contradicts 'supply is derived from confirmed process, not capped by governance.'
- `10_proof_of_transaction_engine/README.md` — Lists 'Deposit Forfeiture Conditions: Penalizes malicious or lazy behavior' linking pot_slashing_conditions.md — a validator deposit/slashing (stake-and-slash) model. A forfeitable node deposit is locked collateral (a stake / held supply), contradicting the canon node model (influence = work + reputation, no stake) and the no-speculative-hold invariant.
- `10_proof_of_transaction_engine/pot_engine_overview.md` — Speak-as-a-role org-model contamination (category 4), carrying no literal firewall term: the doc narrates 'As UX Researcher, PoT enables seamless micro-transactions...' and 'As Revenue Model Architect, it ties revenue to real TX fees.' These are the residue of the multi-persona team-of-roles authoring model, not node roles.
- `10_proof_of_transaction_engine/pot_slashing_conditions.md` ⛔(re-audit: CUT) — Whole file is slashing-against-a-held-stake: 'Slash Amount = stake * severity_factor' and burnStake(node, slashAmt) with 25%/50%/100% stake slashes. Presupposes and penalizes a held stake balance — a held-circulating-supply / born-and-burned violation with no canon-salvageable core (canon: node influence = work+reputation, no staking).
- `10_proof_of_transaction_engine/pot_tx_validation_logic.md` — Speak-as-a-role org-model contamination (category 4): 'As Regulatory Strategist, validation includes AML flags for compliance.' A professional role speaking/emitting a design decision — the prohibited persona org model, distinct from node validator/attester roles.
- `11_node_security_and_payments/README.md` — Module thesis is the prohibited held-supply staking model as load-bearing: enforces 'the "PoT Activity + Security Deposit" rule, ensuring that all participants have "skin in the game"' and handles 'deposit locking' and 'punitive forfeiting.' Locked/held deposits and slashing contradict the no-speculative-hold, born-and-burned canon.
- `11_node_security_and_payments/deposit_forfeiture_rules.md` ⛔(re-audit: CUT) — Whole file forfeits/burns held validator deposits ('burn_amount = validator_deposit x penalty_ratio') and adds vote-weighted governance slashing ('Governance Slash — via governance override vote', 'Manual forfeit requires >=66% validator vote'). Slashing-against-held-deposit + vote-weighted governance; entirely the prohibited concept.
- `11_node_security_and_payments/deposit_freeze_unlock_rules.md` ⛔(re-audit: CUT) — Whole file is the locked-collateral lifecycle: 'Deposit funds are treated as locked collateral — bound to validator duties and performance — and cannot be freely moved,' with freeze/unlock/withdraw of held deposits. Held-circulating-supply / lockup model with no salvageable canon core.
- `11_node_security_and_payments/deposit_governance_interface.md` ⛔(re-audit: CUT) — Token-weighted governance controlling emission: 'Governance Token Required | Yes (1 vote = 1 GOVTKN)' voting that per the overview affects 'emission parameters,' plus adjustEpochParameters()/epoch/modify. This is governance-vote minting / supply capped-by-governance (contradicts 'supply derived from confirmed process, not capped by governance'); the whole file is this prohibited concept.
- `11_node_security_and_payments/node_epoch_commitments.md` — Mandatory held deposit bound to epochs (held-circulating-supply / lockup): 'Min Deposit 10,000 AROS', 'Deposit Lock Activated', 'Early withdrawals are forbidden unless triggered by governance override.' Epoch scheduling kernel may be salvageable, but the load-bearing locked-deposit staking model is a born-and-burned violation.
- `11_node_security_and_payments/node_performance_score.md` — Otherwise canon-aligned work/reputation score, but wired to the held-stake model: tier outcome '<0.30 -> 0x (No payment), Immediate Slash', 'unlock security deposit benefits', and 'Score weights are adjustable via governance vote.' Slashing-against-stake / held-deposit coupling plus governance control of scoring.
- `11_node_security_and_payments/node_registration.md` — Participation gated on a locked deposit (held-circulating-supply / lockup-to-participate): 'Deposit Commitment >= 10,000 AROS' and 'Node Security Deposit Contract | deposit() | Locks required AROS.' Node onboarding is canon, but the mandatory locked-stake requirement is a born-and-burned violation.
- `11_node_security_and_payments/payment_distribution_engine.md` — Post-factum payout core is canon, but contaminated by: 'Deposit Weight — Validator's deposit relative to total active deposit' as a payment component (stake-weighted yield / lockup-for-yield), 'Base Epoch Payment — Fixed emission allocation for each epoch' (emission not gated by confirmed PoT work), and 'Epoch Bonus — Randomized incentive pools for top performers' (farming).
- `14_decentralized_tx_encoding/decentralized_tx_encoding.md` — Section 6 Sybil-resistance asserts 'Encoding nodes require staking and PoT reputation score >=0.8.' Required staking = held/locked bond for participation, a prohibited held-supply/lockup mechanism; canon achieves Sybil resistance via identity + reputation (no staking), per ADR-001 and the ast-core spec ('influence from work+reputation (no staking)').
- `14_decentralized_tx_encoding/dte_governance_upgradability.md` — Section 4.3 sets the Validator Assembly approval threshold at '>= 67% of total stake' - stake/token-weighted on-chain governance presupposing held/locked stake. Contradicts canon (no token-weighted governance; node influence = work + reputation; no held stake).
- `14_decentralized_tx_encoding/dte_security_threat_models.md` — Section 3.3 mitigation asserts 'Security Deposit-slash penalties for proven malicious consensus participation' - a posted, slashable security deposit is held/locked collateral (held circulating supply), a Model-A staking/slashing-against-balance remnant contrary to canon (influence = work + reputation, penalties hit reputation/admission, not a locked stake).
- `CLAUDE.md` — Describes the All-Seeing Eye as strictly passive with no veto: 'All-Seeing Eye is passive: observe -> log -> compare -> signal. It must never change state, halt, vote, or enforce,' and 'AI agents -> passive observation aligned with the Eye.' Canon grants the Eye veto (observes + can veto); 'must never halt... or enforce' directly contradicts the canon veto. (Also pervasive define-by-negation against a predecessor 'Model-A' framing.)
- `deployment_guide.md` ⛔(re-audit: CUT) — Entire document is an external-crypto / Ethereum-chain deployment guide built on cut-forever concepts: deploys ArosCoin as a Solidity contract to Sepolia/mainnet, requires MetaMask + testnet ETH, Alchemy/Infura, and Etherscan verification; load-bearing external-crypto 'bridges' plus a Chainalysis KYC/AML custody/compliance oracle ('Compliance: Configure KYC/AML oracle keys'). Emission is NOT PoT-gated — the ArosCoin test mints arbitrary tokens directly via coin.mint(AddressZero, 1000). Governance also referenced. The whole file is the external-crypto/custody-bridging concept, contradicting AST's self-sufficient, PoT-gated, born-and-burned canon.
- `docs/adr/ADR-005-Emergency-Governance-Procedures.md` ⛔(re-audit: CUT) — Whole file is a Model-A governance 'circuit-breaker/stop-button.' Every load-bearing mechanism is prohibited: 'freezing token contracts' (token_lock_unlock_rules -> held/locked supply), 'initiating emission rollbacks' (emission_rollbacks_and_freeze_rules -> governance-controlled emission NOT gated by PoT, violating born-and-burned atomicity and 'supply derived from process, not capped by governance'), and 'pausing the Bridge Layer (Module 05)' (external bridging as a load-bearing subsystem). No canon-compatible core remains.
- `docs/adr/ADR-006-Multi-Layered-Audit-Trail.md` — Layer 2 'Token Trail' asserts the protocol-level token operations are 'Mint, Burn, Lock, and Freeze.' Lock/Freeze are first-class token operations implying held/frozen circulating supply, contradicting born-and-burned (only PoT-mint and burn exist; no lock/freeze of supply).
- `docs/api/AST_API_Spec.md` — Account balance response exposes a 'locked':'500.000000000' sub-balance, asserting held/locked circulating supply. Contradicts born-and-burned canon (tokens minted only via PoT and burned atomically; earned value retained, no lockups/held speculative balance).
- `docs/api/module_02_nodechain.md` — The /consensus/epoch/current response hardcodes a supply cap: 'maxSupply':'1000000000.000000000' alongside 'minted' (Data_Model.md confirms maxSupply = 'total supply cap'). A governance/protocol-fixed max supply contradicts the canon invariant that ArosCoin supply is derived from confirmed PoT process and is NOT capped.
- `docs/data/Data_Model.md` — epoch.schema defines maxSupply as 'the total supply cap' and says epochs 'control network-wide events, such as emission' (time/epoch-driven, governance-capped emission) which violates canon 'emitted ONLY via PoT' and 'supply derived from process, not capped by governance'; audit_log_entry action enum is MINT/BURN/LOCK/GOVERNANCE_VOTE with actor 'governance-module', encoding lockups and governance-vote minting.
- `docs/processing/README.md` — Frames the directory as covering 'conversion, and custodial logic' and describes the ArosCoin Conversion doc as 'Official procedures for converting fiat/crypto to ArosCoin, ensuring asset-backed issuance' — external crypto/fiat ingestion plus mint-on-deposit custodial conversion as load-bearing, contradicting born-and-burned / PoT-gated emission.
- `docs/security/Security_Standard.md` — Core Principle #3 makes 'All value entering or exiting the platform must pass through the Regulatory Compliance Bridge (ADR-003)' a mandatory invariant (fiat/custody value in/out bridging as load-bearing); also a smart-contract Token (Module 03) whose minting ownership is 'held by the Governance Layer (Module 06)'.
- `docs/testing/Test_Strategy.md` — The canonical E2E tokenization flow is '/kyc/submit -> /bridge/tokenize -> /account/balance -> Verify balance has increased' — a mint-on-deposit crypto/fiat bridge as the load-bearing user flow, contradicting canon (no external ingestion, emission only via PoT).
- `reference/ast-core/README.md` — The All-Seeing Eye entity is described as 'passive oversight: observe->log->compare->signal' — strictly passive, signal-only, with no veto or enforcement. This contradicts the canon in which the All-Seeing Eye can veto (observes + can veto, does not initiate).

### N. Forbidden vocabulary — 'reward' / 'incentive' used as the payment mechanism's basis (canon: only PoT-confirmed payment, never reward/incentive)
_3 file(s)_

- `02_nodechain_engine/nodechain_overview.md` — Forbidden vocabulary as the mechanism's basis: L14 names PoT the 'non-mining, **work-based incentive** mechanism'. Canon: AST has no incentive — only payment for PoT-confirmed work. Reframe, do not migrate as-is.
- `docs/adr/ADR-001-Network_Consensus_Model.md` — Forbidden vocabulary: L29 'aligning **incentives** with network work.' Canon uses payment-for-executed-work, not incentive framing. Surface for reword.
- `scripts/simulate_flow.ts` — Forbidden vocabulary: L9 comment 'Fee Distribution: Trigger Epoch to distribute **rewards**.' Payment is not a reward. Reframe comment.

_Surfaced but kept (the word is canon-**affirming** here — a negation or the enforcement ban itself, not the mechanism's basis):_ `src/nodes/nodes.service.ts` ('does not reward or punish'), `tools/spec_rules.json` + `tools/ast_logic_guard.py` (the guard's forbidden-term list), `docs/specs/AST_PoT_AGENT_EN.md` (contrasts PoW/PoS 'reward' with PoT 'pays', concludes no reward). Say the word and I'll move any of these to REVIEW too.

---

## CUT — will NOT migrate

### 'Team of 20 roles' org model — CUT-epoch  (1)
- `docs/architecture_team_roles.md`

### AFC/ALB-framed docs (AFC interface, custodial conversion, FX pricing)  (6)
- `docs/README.md`
- `docs/architecture/AST_AFC_Interface.md`
- `docs/processing/ArosCoin Conversion and Custodial Logic – Official.md`
- `docs/tokenomics/README.md`
- `docs/tokenomics/pricing_model.md`
- `docs/tokenomics/proofs.md`

### ALB deposit / off-chain custody model  (1)
- `11_node_security_and_payments/deposit_compliance.md`

### Bridge layer (fiat/crypto gateway, KYC tokenization) — ALB epoch  (14)
- `05_bridge_layer/README.md`
- `05_bridge_layer/bridge_access_control.md`
- `05_bridge_layer/bridge_layer_overview.md`
- `05_bridge_layer/bridge_liquidity_routing.md`
- `05_bridge_layer/bridge_threat_model.md`
- `05_bridge_layer/external_protocol_adapter.md`
- `05_bridge_layer/kyc_aml_interface_bridge.md`
- `05_bridge_layer/multi_network_bridge_logic.md`
- `05_bridge_layer/reverse_tokenization_bridge.md`
- `05_bridge_layer/tokenization_bridge_architecture.md`
- `docs/adr/ADR-003-Regulatory-Compliance-Bridge.md`
- `docs/api/ALB_AST_API.md`
- `docs/api/module_05_bridge.md`
- `docs/requirements/schemas/bridge_request.schema.json`

### Epoch debris (CI logs, agent-run reports, empty stubs)  (23)
- `AGENT_AUTOMATOR_REPORT.md`
- `AGENT_CHAIN_REPORT.md`
- `AGENT_CORE_REPORT.md`
- `ci_logs.zip`
- `failed_job_names.txt`
- `failed_jobs.json`
- `fix_output.txt`
- `full_ci_log.txt`
- `payment_rate`
- `payout_pool`
- `reports/logic_guard/ast_report.json`
- `reports/logic_guard/ast_summary.md`
- `settle_payments`
- `ci_logs/**` (CI run logs)

### External crypto ingestion (BTC/ETH in/out) — CUT-forever  (6)
- `09_crypto_ingestion_pipeline/External Crypto Ingestion.md`
- `09_crypto_ingestion_pipeline/README.md`
- `09_crypto_ingestion_pipeline/crypto_exit_pipeline.md`
- `09_crypto_ingestion_pipeline/crypto_to_aroscoin_conversion.md`
- `09_crypto_ingestion_pipeline/crypto_tx_normalization.md`
- `09_crypto_ingestion_pipeline/multi_chain_bridge_registry.md`

### Generated / regenerable build output (artifacts, typechain, cache, lockfiles)  (65)
- `frontend/package-lock.json`
- `reference/ast-core/package-lock.json`
- `smart_contracts/cache/solidity-files-cache.json`
- `smart_contracts/package-lock.json`
- `smart_contracts/artifacts/**`, `smart_contracts/typechain-types/**`, `smart_contracts/cache/**` (generated)

### Value circulation (buyback / liquidity pools / price-stability) — ALB epoch  (6)
- `01_coin_engine/coin_volatility_controls.md`
- `04_aros_value_circulation/README.md`
- `04_aros_value_circulation/aroscoin_buyback_mechanism.md`
- `04_aros_value_circulation/aroscoin_entry_exit_rules.md`
- `04_aros_value_circulation/liquidity_pool_mechanism.md`
- `04_aros_value_circulation/value_circulation_overview.md`

---

## KEEP — staged in `review-staging/` (cleaned, firewall-gate passed)

_179 files. Grouped by area. Files edited to remove AFC/ALB lines are marked ✂._

### (root files)  (19)
- `.editorconfig`
- `.env.example`
- `.eslintrc.json`
- `.gitattributes`
- `.gitignore`
- `.nvmrc`
- `.prettierrc`
- `AGENTS.md`
- `Dockerfile`
- `LICENSE`
- `SECURITY.md`
- `VERSION`
- `docker-compose.yml`
- `jest.config.ts`
- `package-lock.json`
- `package.json`
- `requirements.txt`
- `tsconfig.build.json`
- `tsconfig.json`

### .github  (10)
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/custom.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/agent-dispatcher.yml`
- `.github/workflows/ai-review.yml`
- `.github/workflows/auto-fix.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/copilot-setup-steps.yml`

### 01_coin_engine  (2)
- `01_coin_engine/README.md` ✂
- `01_coin_engine/node_participation_payments.md`

### 02_nodechain_engine  (10)
- `02_nodechain_engine/Cargo.toml`
- `02_nodechain_engine/README.md`
- `02_nodechain_engine/encryption_protocol.md`
- `02_nodechain_engine/network_consensus_model.md`
- `02_nodechain_engine/node_payment_allocation.md`
- `02_nodechain_engine/nodechain_fault_tolerance.md`
- `02_nodechain_engine/shard_quorum_protocol.md`
- `02_nodechain_engine/shard_signature_model.md`
- `02_nodechain_engine/shard_validation_protocol.md`
- `02_nodechain_engine/transaction_sharding_logic.md`

### 03_token_management_layer  (5)
- `03_token_management_layer/contract_self_destruct_policy.md`
- `03_token_management_layer/contract_upgrade_proxy.md`
- `03_token_management_layer/contract_versioning_policy.md`
- `03_token_management_layer/smart_contract_upgrade_policy.md`
- `03_token_management_layer/token_audit_trail.md`

### 06_governance_layer  (2)
- `06_governance_layer/emergency_governance_procedures.md`
- `06_governance_layer/governance_auditability.md`

### 07_processing_layer  (15)
- `07_processing_layer/README.md`
- `07_processing_layer/TX STRUCTURE & METADATA.md`
- `07_processing_layer/tx_audit_log_format.md`
- `07_processing_layer/tx_batching_and_sharding.md`
- `07_processing_layer/tx_dispatch_engine.md`
- `07_processing_layer/tx_execution_contexts.md`
- `07_processing_layer/tx_execution_guardrails.md`
- `07_processing_layer/tx_failure_modes.md`
- `07_processing_layer/tx_hash_map_index.md`
- `07_processing_layer/tx_journal_writer.md`
- `07_processing_layer/tx_rollback_strategy.md`
- `07_processing_layer/tx_simulation_mode.md`
- `07_processing_layer/tx_state_snapshot_hook.md`
- `07_processing_layer/tx_trace_flags.md`
- `07_processing_layer/tx_validation_pipeline.md`

### 08_fee_distribution  (3)
- `08_fee_distribution/README.md`
- `08_fee_distribution/emission_fraud_prevention.md`
- `08_fee_distribution/emission_reporting_and_traceability.md`

### 10_proof_of_transaction_engine  (4)
- `10_proof_of_transaction_engine/pot_challenge_response.md`
- `10_proof_of_transaction_engine/pot_node_role_assignment.md`
- `10_proof_of_transaction_engine/pot_tx_signature_model.md`
- `10_proof_of_transaction_engine/pot_tx_weighting_model.md`

### 12_nodechain_ai_agents  (9)
- `12_nodechain_ai_agents/anomaly_detection_engine.md`
- `12_nodechain_ai_agents/requirements.txt`
- `12_nodechain_ai_agents/src/agent_base.py`
- `12_nodechain_ai_agents/src/anomaly_detection_engine.py`
- `12_nodechain_ai_agents/src/main.py`
- `12_nodechain_ai_agents/src/meta_learning.py`
- `12_nodechain_ai_agents/src/schemas.py`
- `12_nodechain_ai_agents/tests/test_ade.py`
- `12_nodechain_ai_agents/tests/test_ade_unittest.py`

### 14_decentralized_tx_encoding  (2)
- `14_decentralized_tx_encoding/README.md`
- `14_decentralized_tx_encoding/dte_testing_benchmarking.md`

### docs  (20)
- `docs/adr/ADR-002-AI_Supervisory_Framework.md`
- `docs/adr/ADR-004-Network-Sharding-Strategy.md`
- `docs/api/module_12_ai_agents.md`
- `docs/development_guide.md`
- `docs/operations/Runbook.md`
- `docs/processing/Processing_Spec.md`
- `docs/requirements/schemas/audit_log_entry.schema.json` ✂
- `docs/requirements/schemas/epoch.schema.json`
- `docs/requirements/schemas/risk_score.schema.json` ✂
- `docs/requirements/schemas/transaction.schema.json`
- `docs/specs/AST_ArosCoin_AGENT_EN.md`
- `docs/specs/AST_NodeChain_AGENT_EN.md`
- `docs/specs/AST_Nodes_AGENT_EN.md`
- `docs/specs/AST_PoT_AGENT_EN.md`
- `docs/specs/AST_Release_AGENT_EN.md`
- `docs/specs/AST_StateRecording_AGENT_EN.md`
- `docs/standards/Coding_Standards.md`
- `docs/standards/Contribution_Guide.md`
- `docs/testing_guide.md`
- `docs/tokenomics/validator_metrics.md`

### reference  (16)
- `reference/ast-core/package.json`
- `reference/ast-core/src/allSeeingEye.ts`
- `reference/ast-core/src/aroscoin.ts`
- `reference/ast-core/src/demo.ts`
- `reference/ast-core/src/emission.ts`
- `reference/ast-core/src/invariants.test.ts`
- `reference/ast-core/src/nodechain.ts`
- `reference/ast-core/src/nodes.ts`
- `reference/ast-core/src/orchestrator.ts`
- `reference/ast-core/src/pot.ts`
- `reference/ast-core/src/release.ts`
- `reference/ast-core/src/reserve.ts`
- `reference/ast-core/src/stateRecording.ts`
- `reference/ast-core/src/types.ts`
- `reference/ast-core/src/util.ts`
- `reference/ast-core/tsconfig.json`

### scripts  (6)
- `scripts/agents-status.ts`
- `scripts/check-prohibitions.sh`
- `scripts/fix-angular-devkit.js`
- `scripts/fix-ci.ts`
- `scripts/nightly-audit.ts`
- `scripts/test_governance.ts`

### smart_contracts  (4)
- `smart_contracts/hardhat.config.ts`
- `smart_contracts/package.json`
- `smart_contracts/scripts/deploy.ts`
- `smart_contracts/tsconfig.json`

### src  (47)
- `src/AST-Aros-Financial-Paradigm.code-workspace`
- `src/app.controller.spec.ts`
- `src/app.controller.ts`
- `src/app.module.ts`
- `src/aroscoin/aroscoin.module.ts`
- `src/aroscoin/aroscoin.service.spec.ts`
- `src/aroscoin/aroscoin.service.ts`
- `src/aroscoin/entities/aroscoin-ledger.entity.ts`
- `src/commission/commission.service.spec.ts`
- `src/common/clock.service.spec.ts`
- `src/common/clock.service.ts`
- `src/common/common.module.ts`
- `src/common/hash.util.spec.ts`
- `src/common/hash.util.ts`
- `src/emission/emission.module.ts`
- `src/main.ts`
- `src/nodechain/dto/append-event.dto.spec.ts`
- `src/nodechain/dto/append-event.dto.ts`
- `src/nodechain/entities/execution-snapshot.entity.ts`
- `src/nodechain/nodechain.module.ts`
- `src/nodechain/nodechain.service.spec.ts`
- `src/nodechain/nodechain.service.ts`
- `src/nodes/dto/register-node.dto.spec.ts`
- `src/nodes/dto/register-node.dto.ts`
- `src/nodes/entities/node.entity.ts`
- `src/nodes/nodes.module.ts`
- `src/nodes/nodes.service.spec.ts`
- `src/nodes/nodes.service.ts`
- `src/orchestrator/dto/run-process.dto.spec.ts`
- `src/orchestrator/dto/run-process.dto.ts`
- `src/orchestrator/metrics.controller.spec.ts`
- `src/orchestrator/metrics.controller.ts`
- `src/orchestrator/orchestrator.controller.spec.ts`
- `src/orchestrator/orchestrator.controller.ts`
- `src/orchestrator/orchestrator.module.ts`
- `src/pot/entities/pot-verdict.entity.ts`
- `src/pot/pot.module.ts`
- `src/pot/pot.service.spec.ts`
- `src/pot/pot.service.ts`
- `src/release/entities/release-phase.entity.ts`
- `src/release/release.module.ts`
- `src/release/release.service.spec.ts`
- `src/release/release.service.ts`
- `src/reserve/reserve.module.ts`
- `src/state-recording/state-recording.module.ts`
- `src/state-recording/state-recording.service.spec.ts`
- `src/state-recording/state-recording.service.ts`

### tests  (2)
- `tests/e2e/app.e2e-spec.ts`
- `tests/jest-e2e.json`

### tools  (3)
- `tools/ast_logic_guard.py`
- `tools/prometheus/prometheus.yml`
- `tools/spec_rules.json`

---

## What happens in STEP 2 (only after you confirm)

1. You tell me which REVIEW-KETEVAN files to migrate and how to resolve A–F above.
2. I migrate only the approved files into the target structure (`docs/`, `entities/`, `rules/`, `.github/`).
3. Firewall gate must be empty before commit.
4. Commit + push. **Note:** the STEP-2 brief says `push origin main`, but my working branch is `claude/product-lifecycle-setup-4nt8ld` and I won't push to `main` without your explicit go — flagging this so you can confirm the target branch.

---

## APPENDIX — full per-file table (all 483 files)

Every tracked file, grouped by directory. **Verdict is authoritative** (includes the section-M re-audit and section-N vocabulary downgrades); reason/firewall/strip come from the directory classifier that read the file. Generated build output and CI logs are collapsed into one row each.

### `01_coin_engine/`
_11 files — KEEP 2 · CUT 1 · REVIEW 8_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `AROS_Coin_TokenSpec.json` | REVIEW-KETEVAN | Contradicts canon: burnOn governance_rule (not PoT born-and-burned atomic); unresolved forks — decimals 8 vs README's 6; split 75/20/5 (nodeOperators/AST treasury/Audit Pool) vs canonical 75/25 | none | N/A (fork — do not resolve) |
| `AST Node Infrastructure Specification.md` | REVIEW-KETEVAN | Affirmative validator staking / security deposit ('Validator node must stake minimum X ARO'; §4 'Registration and Security Deposit'), stake slashing ('Malicious tampering → Stake slashing & blacklist'), and governance-vote enforce… | none | moved KEEP→REVIEW |
| `README.md` | KEEP | Core ACE overview; only incidental AFC/ALB prose clause, meaning intact after removal | AFC@5(x2), ALB@5 | Line 5 clause: "It is independent of AFC or ALB — integration with fiat systems happens on… |
| `aro_emission_protocol.md` | REVIEW-KETEVAN | AFC is load-bearing in code symbols/event names (afcShare, AFC_RESERVE, updateAfcReserve, SYSTEM_AFC_RESERVE, totalAfcReserve, AFC Reserve Index); 25% "AFC reserve" is a fork (own vs external) | AFC@24, AFC@26, afcShare/AFC_RESERVE@42, updateAfcReserve/afcShare@43, AFC Reser… | N/A (identifiers + fork — do not strip) |
| `burn_and_mint_rules.md` | REVIEW-KETEVAN | Otherwise-canonical Model 1, but "25% → AFC reserve / AFC share" is a fork (AST's own reserve vs external entity) — cannot auto-resolve | AFC@77 | N/A (fork — do not resolve) |
| `burn_mechanism.md` | REVIEW-KETEVAN | Contradicts canonical born-and-burned atomic net-zero model; describes deflationary "higher value per ARO" + supply-ceiling/velocity overflow throttle (price/supply stability); forks with burn_and_mint_rules.md Model 1 | none | N/A (canon contradiction + fork) |
| `coin_emission_model.md` | REVIEW-KETEVAN | AFC load-bearing as identifier + event name (SYSTEM_AFC_RESERVE_000000000000000000, reserve.afc.accrual); 25% "AFC reserve" fork | AFC Reserve@20, AFC reserve@30, AFC reserve@45, reserve.afc.accrual@46, AFC accr… | N/A (identifiers + fork — do not strip) |
| `coin_use_cases.md` | REVIEW-KETEVAN | AFC defined as "Aros Financial Core" (load-bearing) in a core use-case section; fiat↔crypto bridging (CUT: fiat processing) + liquidity pools/stability reserve (CUT concepts) interwoven with keepable use cases | AFC/Aros Financial Core@25, AFC@39, liquidity pools@71 | N/A (load-bearing AFC definition + CUT-content sections #2 and #6) |
| `coin_volatility_controls.md` | CUT | Entire file is a market price-stability/volatility mechanism (price-delta freeze, reject high-volume sales/swaps, correction burn) — CUT-FOREVER "price-stability" concept, contradicts non-speculative canon | none | N/A (CUT) |
| `node_participation_payments.md` | KEEP | Core node-incentive payment logic in ARO; post-factum (batched payout); firewall-clean | none | none |
| `payment_distribution.md` | REVIEW-KETEVAN | AFC load-bearing (section title "§4 AFC Reserve Logic", identifier SYSTEM_AFC_RESERVE_000000000000000000); 25% "AFC reserve" fork | AFC Reserve@24, AFC reserve@28, AFC Reserve Logic@48, SYSTEM_AFC_RESERVE@50, AFC… | N/A (title/identifier + fork — do not strip) |

### `02_nodechain_engine/`
_13 files — KEEP 10 · CUT 0 · REVIEW 3_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `Cargo.toml` | KEEP | Rust toolchain config matching core stack (tokio/serde/axum/tonic); firewall-clean | none | none |
| `README.md` | KEEP | Core NodeChain engine overview; firewall-clean | none | none |
| `encryption_protocol.md` | KEEP | Core partial-fragment encryption spec; firewall-clean (grep "eth" hit is false positive inside "method"@80) | none | none |
| `network_consensus_model.md` | KEEP | Core proof-of-processing/quorum consensus; "forkability" is a software feature, not a decision fork; firewall-clean | none | none |
| `node_payment_allocation.md` | KEEP | Core node payment allocation, post-factum (contribution-based), paid in ArosCoin; firewall-clean | none | none |
| `node_registration_and_auth.md` | REVIEW-KETEVAN | Affirmative 'Integrity staking: optional escrow for trust-sensitive roles' plus validator 'Security Deposit & audit' as a live registration step in the onboarding flowchart (not a prohibition). Locked escrow/deposit = held circula… | none | moved KEEP→REVIEW |
| `nodechain_fault_tolerance.md` | KEEP | Core fault-tolerance/recovery spec; firewall-clean | none | none |
| `nodechain_overview.md` | REVIEW-KETEVAN | Forbidden vocabulary as the mechanism's basis: L14 names PoT the 'non-mining, **work-based incentive** mechanism'. Canon: AST has no incentive — only payment for PoT-confirmed work. Reframe, do not migrate as-is. | none | moved KEEP→REVIEW |
| `nodechain_security_model.md` | REVIEW-KETEVAN | 'Entry into the network is gated via staking and cryptographic challenge' (§2.1) and Sybil resistance 'via Cryptographic staking' (§4) use staking affirmatively as a network-entry gate = held/locked ArosCoin (lockup / held circula… | none | moved KEEP→REVIEW |
| `shard_quorum_protocol.md` | KEEP | Core shard quorum/consensus protocol; firewall-clean | none | none |
| `shard_signature_model.md` | KEEP | Core shard signature model (ECDSA/secp256k1, not crypto-asset); firewall-clean | none | none |
| `shard_validation_protocol.md` | KEEP | Core shard validation/quorum protocol; firewall-clean | none | none |
| `transaction_sharding_logic.md` | KEEP | Core transaction sharding logic; currency "AROS"; firewall-clean | none | none |

### `03_token_management_layer/`
_13 files — KEEP 5 · CUT 0 · REVIEW 8_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `README.md` | REVIEW-KETEVAN | Emission described as NOT PoT-gated: 'enforces rules for minting, burning, and locking tokens based on on-chain activity and governance decisions' = governance-vote minting + token locking. 'Supply Governance: Controls parameters … | none | moved KEEP→REVIEW |
| `aroscoin_supply_model.md` | REVIEW-KETEVAN | Pre-mine allocation (Genesis Reserve 15%, Dev Fund, Treasury, Public Circulation 30%) + multi-year vesting contradicts born-and-burned / PoT-only / no-speculative-hold canon. | none | N/A |
| `burn_mechanism.md` | REVIEW-KETEVAN | Contains velocity-throttle-of-held-supply and a supply cap: overflow burn triggers on 'velocity_of_token < minimum_velocity_threshold' and 'total_supply > target_ceiling' (Max total supply 1,000,000,000 ARO). Also a price/value-ap… | none | moved KEEP→REVIEW |
| `contract_self_destruct_policy.md` | KEEP | Contract-lifecycle governance; All-Seeing Eye validation/veto consistent; Solidity core. | none | incidental scope words "bridge contracts", "staking/vaulting" (l.13) |
| `contract_upgrade_proxy.md` | KEEP | Transparent proxy upgrade pattern; All-Seeing Eye oversight (observes/veto). Solidity core. | none | none |
| `contract_versioning_policy.md` | KEEP | SemVer contract policy; All-Seeing Eye rollback. Clean. | none | trailing Russian generation-artifact prompt (l.81) |
| `smart_contract_registry.md` | REVIEW-KETEVAN | Registry enshrines prohibited contract types as first-class AST infrastructure: 'Vaults / Secure holding contracts for treasury & payments' = held/treasury circulating supply; 'SwapGate / Optional layer for token swaps' = swap/liq… | none | moved KEEP→REVIEW |
| `smart_contract_upgrade_policy.md` | KEEP | Upgrade policy; All-Seeing Eye validation; Anchor hits are technical (backwards-link anchoring), not AFC actor → firewall-clean. | Anchoring@35, Anchoring@46, Anchor@62 (technical, not AFC) | incidental scope: "Bridge and inter-chain wrappers", "ARO-X", "staking logic" (l.13-17) |
| `token_audit_trail.md` | KEEP | On-chain audit/Merkle/validator checkpoints; NodeChain sync; All-Seeing Eye logs. Clean. | none | none |
| `token_distribution_model.md` | REVIEW-KETEVAN | Mints 40% into held pools with **25% Ecosystem Reserve** share carve-out — matches flagged 25% reserve-share fork and contradicts born-and-burned atomic PoT. | none | N/A |
| `token_issuance_protocol.md` | REVIEW-KETEVAN | PoT emission principles are canon-clean, but "Token Distribution at Issuance" injects 25% Ecosystem Reserve + 40% non-node carve-out (fork + contradicts born-and-burned); load-bearing, can't cleanly strip. | none | N/A |
| `token_lock_unlock_rules.md` | REVIEW-KETEVAN | Whole doc is founder/advisor/private-round/public-sale vesting + relock-for-voting-weight farming — speculative hold/farming apparatus contradicting canon; unsalvageable by line-strip. | none | N/A |
| `token_supply_governance.md` | REVIEW-KETEVAN | Governance-vote minting (mintable_pool, mintRequest, "controlled minting for exceptional needs") contradicts PoT-only emission; genesis circulation/supply_floor/"strategic liquidity freezes" add stability mechanics against canon. | none | N/A |

### `aros-tokenomics/`
_12 files — KEEP 0 · CUT 0 · REVIEW 12_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `03_token_management_layer/aroscoin_supply_model.md` | REVIEW-KETEVAN | Same pre-mine/vesting allocation model (code-fenced, "Emission Schedule"); contradicts born-and-burned/PoT-only. Not byte-identical to counterpart. | none | N/A |
| `03_token_management_layer/burn_mechanism.md` | REVIEW-KETEVAN | Same as counterpart, wrapped in code fence; not byte-identical. Clean. | none | none |
| `03_token_management_layer/contract_self_destruct_policy.md` | REVIEW-KETEVAN | Variant of counterpart (code-fenced), not byte-identical; same clean core. | none | incidental "bridge contracts", "staking/vaulting" (l.18) |
| `03_token_management_layer/contract_upgrade_proxy.md` | REVIEW-KETEVAN | Code-fenced variant of counterpart, not byte-identical; clean core. | none | none |
| `03_token_management_layer/contract_versioning_policy.md` | REVIEW-KETEVAN | Variant of counterpart, not byte-identical; clean core. | none | trailing Russian artifact prompt (l.87) |
| `03_token_management_layer/smart_contract_registry.md` | REVIEW-KETEVAN | Variant of counterpart; uses non-canon "Aros Blockchain"; clean, not byte-identical. | none | "Aros Blockchain"→"NodeChain" (l.10); "SwapGate"/"staker" |
| `03_token_management_layer/smart_contract_upgrade_policy.md` | REVIEW-KETEVAN | Variant of counterpart, not byte-identical; Anchor hits technical. | Anchoring@45, Anchoring@56, Anchor@72 (technical, not AFC) | "Aros Blockchain"→"NodeChain" (l.34); "Bridge/inter-chain wrappers", "ARO-X", "staking" (l… |
| `03_token_management_layer/token_audit_trail.md` | REVIEW-KETEVAN | Code-fenced variant of counterpart, not byte-identical; clean core. | none | none |
| `03_token_management_layer/token_distribution_model.md` | REVIEW-KETEVAN | Same 60/25/10/5 carve-out incl. 25% reserve share; contradicts canon. Variant of counterpart, not byte-identical. | none | N/A |
| `03_token_management_layer/token_issuance_protocol.md` | REVIEW-KETEVAN | Same issuance protocol with 25%-reserve carve-out; contradicts canon. Variant of counterpart, not byte-identical. | none | N/A |
| `03_token_management_layer/token_lock_unlock_rules.md` | REVIEW-KETEVAN | Same investor/founder vesting + farming model; contradicts no-speculative-hold canon. Variant of counterpart, not byte-identical. | none | N/A |
| `03_token_management_layer/token_supply_governance.md` | REVIEW-KETEVAN | Same governance-vote mint + genesis-circulation model; contradicts PoT-only. Variant of counterpart, not byte-identical. | none | N/A |

### `04_aros_value_circulation/`
_11 files — KEEP 0 · CUT 5 · REVIEW 6_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `README.md` | CUT | Layer defined around liquidity pools + buyback + price-floor/stability — explicit ALB-epoch value-circulation model; contradicts PoT-only born-and-burned emission. | liquidity pools@4, buyback@4, price stability@9, buyback+price floors@11, buybac… | N/A (CUT) |
| `aroscoin_buyback_mechanism.md` | CUT | Primary subject IS the buyback mechanism (price-floor, reserve refill) — CUT-forever item. | buyback@1,59,61,97,106,110,111,117,129 | N/A (CUT) |
| `aroscoin_distribution_tiers.md` | REVIEW-KETEVAN | No firewall term, but pre-allocated tiered distribution with vesting/treasury/holding contradicts born-and-burned/PoT-only emission; Tier-3 leans on "Bridged liquidity"/"liquidity bridges". | none (grep); note "Bridged liquidity"@18, "liquidity bridges"@48 | Human decision: whole allocation/vesting model contradicts canon; salvage nothing without … |
| `aroscoin_entry_exit_rules.md` | CUT | Entry/exit = converting external fiat/crypto ↔ ArosCoin + buyback price-floor exit; fiat-side + external-crypto + buyback, contradicts PoT-only emission. | price floor@41 (buys-back); note fiat/crypto entry-exit throughout | N/A (CUT) |
| `aroscoin_internal_flow.md` | REVIEW-KETEVAN | System-triggered/whitelisted/no-P2P flow concept is arguably core, but Buyback Engine is a load-bearing flow node (CUT-item) and file ends with non-English authoring/epoch debris. | none (grep); note "Buyback Engine"@18,19,95; epoch debris (RU)@119-124 | Strip Buyback nodes (lines 18-19, 95, table@95) + epoch-debris tail (119-124); human confi… |
| `aroscoin_release_schedule.md` | REVIEW-KETEVAN | Vesting/cliff/scheduled emission from vaults/treasury contradicts PoT-only born-and-burned atomic emission; buyback integration ref. | none (grep); note "Buyback Engine"@111 | Human decision: scheduled-emission model contradicts canon; strip buyback@111 if any salva… |
| `aroscoin_velocity_control.md` | REVIEW-KETEVAN | Velocity throttling presumes a circulating/held supply (contradicts born-and-burned) yet anti-farming + All-Seeing-Eye align with canon — genuine fork. | none | Human resolves circulating-supply-vs-born-and-burned fork; anti-farming + All-Seeing-Eye l… |
| `liquidity_pool_mechanism.md` | CUT | Primary subject IS liquidity pools + buyback + price-floor exit liquidity — CUT-forever items. | liquidity pools@11, buyback@16,86, price-floor@99, liquidity pools@109, buyback@… | N/A (CUT) |
| `reserve_pool_policy.md` | REVIEW-KETEVAN | "Reserve" is a KEEP-core term, but this reserve is buyback-fed re-mint/emergency-liquidity buffer (contradicts born-and-burned); pure-reserve concept may be salvageable. | buyback@111 (link); note "Buyback Engine" injector@25,90 | Human splits pure reserve/asset-sink concept (core) from buyback-injection + re-mint-buffe… |
| `value_circulation_overview.md` | CUT | Circulation architecture whose core structures are Liquidity Pools + Buyback Engine, goals = price stability/floors; ALB circulation premise, not self-sufficient PoT. | liquidity pools+price stability@22, buyback+price floors@24, buyback@94 | N/A (CUT) |
| `vault_system_design.md` | REVIEW-KETEVAN | Time-locked/vesting vaulting of tokens contradicts born-and-burned atomic emission; buyback integration ref. | none (grep); note "Buyback Engine"@78 | Human decision: token-vaulting contradicts canon; strip buyback integration@78 if salvaged |

### `05_bridge_layer/`
_10 files — KEEP 0 · CUT 10 · REVIEW 0_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `README.md` | CUT | Bridge = gateway converting external fiat/blockchain value ↔ ArosCoin; fiat-side + external-crypto, contradicts self-sufficient PoT-only emission. | none (grep); subject = fiat/crypto bridge | N/A (CUT) |
| `bridge_access_control.md` | CUT | Access-control exists solely to gate the fiat/crypto bridge (entry/exit, KYC jurisdiction); ALB bridge-layer component, no standalone core. | none | N/A (CUT) |
| `bridge_layer_overview.md` | CUT | Connects AST to external fiat banking + other blockchains, mints ArosCoin from external value; fiat-side + external-crypto ingestion. | none (grep); "fiat/crypto → ArosCoin"@21-22 | N/A (CUT) |
| `bridge_liquidity_routing.md` | CUT | Routes bridge liquidity via liquidity pools + fiat/crypto payouts + buyback reserves — CUT-forever items. | liquidity pools@14, buyback@76 | N/A (CUT) |
| `bridge_threat_model.md` | CUT | Threat model for the external fiat/crypto bridge (cross-chain mint/burn, oracles, liquidity); ALB bridge-layer component. | none | N/A (CUT) |
| `external_protocol_adapter.md` | CUT | Adapters to banking rails (IBAN/SWIFT/SEPA), stablecoins, ETH/Polygon/BSC; fiat-side + external-crypto ingestion. | Ethereum@15 | N/A (CUT) |
| `kyc_aml_interface_bridge.md` | CUT | KYC/AML/sanctions/tax compliance for fiat bridge entry/exit; fiat-side/banking processing. | none | N/A (CUT) |
| `multi_network_bridge_logic.md` | CUT | Multi-chain bridging to Ethereum/Bitcoin/Polygon; external-crypto ingestion, contradicts self-sufficiency. | Ethereum@5, Bitcoin@5 | N/A (CUT) |
| `reverse_tokenization_bridge.md` | CUT | Converts ArosCoin → external fiat/crypto exit + buyback redirection; fiat + external-crypto + buyback. | none (grep); note "Buyback Engine"@124, fiat/crypto gateway | N/A (CUT) |
| `tokenization_bridge_architecture.md` | CUT | Mints ArosCoin from external fiat (USD/EUR/TRY/GEL) + crypto (ETH/BTC); fiat-side + external-crypto, contradicts PoT-only born-and-burned. | ETH,BTC@42, buyback@106 | N/A (CUT) |

### `06_governance_layer/`
_9 files — KEEP 2 · CUT 0 · REVIEW 7_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `README.md` | REVIEW-KETEVAN | Describes the governance layer as token-weighted: 'Voting Execution: On-chain, token-weighted voting logic' and 'Governance Token Logic: Management of voting rights and delegation.' A governance token whose holdings/weight confer … | none | moved KEEP→REVIEW |
| `emergency_governance_procedures.md` | KEEP | Freeze/veto/role-suspension procedures; council veto not AFC/ASE; no firewall terms | none | none |
| `governance_auditability.md` | KEEP | Merkle/IPFS/on-chain audit trail; "anchoring" is cryptographic time-anchor, not AFC Anchor actor | none | none |
| `governance_layer_overview.md` | REVIEW-KETEVAN | Load-bearing firewall term (Lac Musa/LacMusa) + ALB epoch reference in Section 5 "Architectural Boundaries"; firewall is absolute, human decision required | LacMusa@62 ("Lac Musa"); ALB@64 | N/A (REVIEW) |
| `governance_roles_and_permissions.md` | REVIEW-KETEVAN | Core governance actions are gated on staked/held governance tokens: 'Voter / May vote on proposals with staked governance tokens' and 'Proposal Author / ... (with token stake).' Voting/proposing weighted by staked token holdings i… | none | moved KEEP→REVIEW |
| `governance_token_logic.md` | REVIEW-KETEVAN | Whole file defines a distinct staked, delegated governance token used for token-weighted voting, with a governance treasury that HOLDS tokens: 'Security Deposit-Based Voting: Governance power is activated only when tokens are stak… [re-audit: CUT] | none | moved KEEP→REVIEW |
| `proposal_submission_protocol.md` | REVIEW-KETEVAN | Eligibility requires holding 'minimum governance token stake' (minProposalStake) and final submission 'burns a small amount of governance tokens' — presupposes a held/staked governance-token supply (held circulating supply / specu… | none | moved KEEP→REVIEW |
| `quorum_validation_rules.md` | REVIEW-KETEVAN | Quorum is defined as participation 'by token weight' computed over 'total eligible staked tokens at snapshot' — token-weighted governance resting on a held/staked circulating supply (born-and-burned violation). Higher impact tiers… | none | moved KEEP→REVIEW |
| `voting_mechanism.md` | REVIEW-KETEVAN | Load-bearing token-weighted, stake-locked governance: 'VotingWeight = stakedGovernanceTokens' and voting rights 'must be actively staked during the voting period.' This presupposes a held/staked circulating supply (born-and-burned… | none | moved KEEP→REVIEW |

### `07_processing_layer/`
_19 files — KEEP 15 · CUT 0 · REVIEW 4_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `README.md` | KEEP | Core index of Processing Layer (dispatch/queue/validation/audit/execution contexts); positive defs, canon-clean. "Processing Team" is generic, not the CUT 20-roles model. | none | none (optional: team stub L19-20) |
| `TX STRUCTURE & METADATA.md` | KEEP | RU chapter-intro/stub for tx envelope/header/fingerprint/replay — core tx-structure concepts, canon-clean. Indexes files not present here but no fork/contradiction. | none | none (cosmetic emoji headers) |
| `TX Validation & Safety.md` | REVIEW-KETEVAN | Title says "Validation & Safety" but body is batching/sharding — near-duplicate of tx_batching_and_sharding.md with mismatched name; canonical owner of "validation & safety" is ambiguous (vs tx_validation_pipeline.md). Content its… | none | N/A (unresolved dup/title mismatch) |
| `tx_audit_log_format.md` | KEEP | Core audit-log schema, hash-chained/signed; canon-aligned (emission quota, node anomalies). "external anchor points for notarization" (L96) is generic Merkle notarization, NOT AFC Anchor. | none | optional reword "anchor points" L96 to avoid watch-word |
| `tx_batching_and_sharding.md` | KEEP | Core batching/sharding for AST scaling; PoT_Attestation_Engine, emission ceilings. "Fee Distribution" = commission synonym. Jurisdiction/geographic-zone framing is generic node distribution, not fiat/banking. | none | optional trim jurisdictional/regulatory framing L13,24,71,84 |
| `tx_dispatch_engine.md` | KEEP | Core deterministic dispatch scheduler; clean, canon-aligned. | none | none |
| `tx_execution_contexts.md` | KEEP | Core isolated execution runtime, rollback/receipts; clean. "Proof-of-Execution Anchors" (L198) generic crypto proof, not AFC. | none | optional reword "Anchors" L198 |
| `tx_execution_guardrails.md` | KEEP | Core runtime guardrails (reject/delay/simulate); canon-aligned emission guardrail. Trailing RU editorial chatter + stray code fences = epoch debris. | none | RU editorial + broken fences L168-173 |
| `tx_failure_modes.md` | KEEP | Core failure taxonomy/error codes; clean. "Fee Distribution" = commission synonym. | none | none |
| `tx_hash_map_index.md` | KEEP | Core PoT/NodeChain hash-lineage index; emission-epoch tracing, canon-aligned. | none | optional reword "PoT hash anchors" L13 (generic) |
| `tx_journal_writer.md` | KEEP | Core append-only TX journal, PoT trace injection; clean. | none | none |
| `tx_queue_handler.md` | REVIEW-KETEVAN | Contradicts self-sufficiency canon: external-crypto-ingestion + cross-chain bridges to external blockchains are woven in as load-bearing architecture (bridge_entry intake source, bridge_io channel, bridge TTL policy) — touches CUT… | none (strict); CUT-epoch: "crypto ingestion"@16, "external blockchains/bridge_en… | strip bridge/cross-chain/crypto-ingestion (L16,168,229,630-631,937,1048,1184,1193-1199); R… |
| `tx_rollback_strategy.md` | KEEP | Canonical rollback-strategy doc; deterministic, atomic, clean. | none | none |
| `tx_simulation_mode.md` | KEEP | Core read-only dry-run/simulation subsystem; does not affect PoT/ledger, canon-safe. | none | none |
| `tx_state_snapshot_hook.md` | KEEP | Core deterministic state-snapshot hook feeding validation/simulation/guardrails; clean. | none | none |
| `tx_trace_flags.md` | KEEP | Core traceability-flag taxonomy; post-factum forensic marking, canon-aligned. | none | none |
| `tx_ttl_expiration md  250f1989022c80c0bc35da35a8324342/tx_lifecycle_management.md` | REVIEW-KETEVAN | Near-duplicate FORK of tx_ttl_expiration.md (near-identical body). Buried in messy Notion-export directory tx_ttl_expiration md 250f1989022c80c0bc35da35a8324342 — FLAG this dir name. Content clean core. | none | dup fork — pick canonical; rename/flag Notion-hash dir |
| `tx_ttl_expiration.md` | REVIEW-KETEVAN | Near-duplicate FORK of tx_lifecycle_management.md (its own L4 says "complete lifecycle management"); must not resolve which is canonical. Also Notion-export debris: broken path link (L85) + notion:// URL (L105). Content clean core… | none | dup fork — pick canonical; strip Notion links L85, L105 |
| `tx_validation_pipeline.md` | KEEP | Core 8-stage validation pipeline; PoT injection, NodeChain reference, emission-readiness — strongly canon-aligned. "Fee Distribution" = commission synonym. | none | optional normalize "Fee Distribution" / "NodeChain_Fee Distribution_Engine" naming (cosmet… |

### `08_fee_distribution/`
_9 files — KEEP 3 · CUT 0 · REVIEW 6_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `README.md` | KEEP | PoT-driven emission of ArosCoin, supply causally linked to usage; aligns with PoT-only emission | none | none |
| `emission_flow_pipeline.md` | REVIEW-KETEVAN | Emission mints a split to a treasury as load-bearing design: Stage 5 'Validator payment split (e.g., 60% to confirming node, 40% to treasury)', 'Governance treasury replenishment', and example distribution.treasury. Stage 4 mints … | none | moved KEEP→REVIEW |
| `emission_fraud_prevention.md` | KEEP | Anti-abuse guardrails for PoT emission (replay, loops, collusion); no firewall terms | none | none |
| `emission_layer_api_interface.md` | REVIEW-KETEVAN | Governance Override API is load-bearing: 'Allows supernodes to freeze, reinstate, or correct emissions', and POST /emission/override lets a governance entity 'correct a misfire, freeze emission, or retroactively revoke it' (author… | none | moved KEEP→REVIEW |
| `emission_layer_overview.md` | REVIEW-KETEVAN | States governance-controlled supply as a core principle: 'Deflation-aware Governance: Supply is bounded per epoch and regulated via emission ceilings' and 'Predictable supply: All emission volumes are pre-modelled and adjustable o… | none | moved KEEP→REVIEW |
| `emission_reporting_and_traceability.md` | KEEP | Emission audit/traceability record structure and hash anchoring; no firewall terms | none | none |
| `emission_rollbacks_and_freeze_rules.md` | REVIEW-KETEVAN | Contains a staking model ('Validator staking payments revoked'), token Soft/Hard Freeze that quarantines tokens and marks them 'non-transferable' (held/frozen circulating supply), and governance multi-sig vote to burn/rollback emi… | none | moved KEEP→REVIEW |
| `emission_trigger_conditions.md` | REVIEW-KETEVAN | "Conditional Exceptions (Governance Controlled)" permit emission via governance/emergency override (Treasury Re-activation, Emergency Liquidity, Post-Audit Reinstatement), contradicting hard invariant "ArosCoin emitted ONLY via Po… | none (Emergency Liquidity@40 is not a firewall term) | N/A (REVIEW) — conflict is L33-43 |
| `epoch_allocation_model.md` | REVIEW-KETEVAN | Defines governance-controlled supply caps (max_emission_cap, 'no bypass ... unless explicitly voted on via governance', 'adjustable ... governance consensus') and allocates each epoch's minted supply by role: Validator 60%, Govern… | none | moved KEEP→REVIEW |

### `09_crypto_ingestion_pipeline/`
_6 files — KEEP 0 · CUT 6 · REVIEW 0_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `External Crypto Ingestion.md` | CUT | Ingests external BTC/ETH/TON/BNB/XMR flows into AST — explicit CUT-forever external-crypto ingestion. | Bitcoin@32, Ethereum@33 | N/A (CUT) |
| `README.md` | CUT | Whole pipeline accepts external crypto (Bitcoin, Ethereum) into AST — explicit CUT-forever (external crypto ingestion). | Bitcoin@4, Ethereum@4 | N/A (CUT) |
| `crypto_exit_pipeline.md` | CUT | Emits ARO balances back out as external crypto (USDT on eth_mainnet); external-crypto egress, contradicts self-sufficiency. | none (grep); note eth_mainnet/USDT targets@33,37 | N/A (CUT) |
| `crypto_to_aroscoin_conversion.md` | CUT | Converts external crypto (ETH etc.) into ArosCoin via conversion rate; external-crypto ingestion + non-PoT minting, contradicts born-and-burned. | ETH@37,38,73 | N/A (CUT) |
| `crypto_tx_normalization.md` | CUT | Normalizes external BTC/ETH/Monero txs for ingestion; support module for CUT-forever external-crypto pipeline. | Bitcoin@16,54; Ethereum@17,55; ETH,BTC@36 | N/A (CUT) |
| `multi_chain_bridge_registry.md` | CUT | Registry mapping external chains (Bitcoin/Ethereum) to ingestion/conversion logic; core of CUT-forever external-crypto pipeline. | Bitcoin@6, Ethereum@6 | N/A (CUT) |

### `10_proof_of_transaction_engine/`
_9 files — KEEP 4 · CUT 0 · REVIEW 5_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `README.md` | REVIEW-KETEVAN | Lists 'Deposit Forfeiture Conditions: Penalizes malicious or lazy behavior' linking pot_slashing_conditions.md — a validator deposit/slashing (stake-and-slash) model. A forfeitable node deposit is locked collateral (a stake / held… | none | moved KEEP→REVIEW |
| `pot_challenge_response.md` | KEEP | Core PoT challenge-response over NodeChain; governance escalation. Clean. | none | none |
| `pot_engine_overview.md` | REVIEW-KETEVAN | Speak-as-a-role org-model contamination (category 4), carrying no literal firewall term: the doc narrates 'As UX Researcher, PoT enables seamless micro-transactions...' and 'As Revenue Model Architect, it ties revenue to real TX f… | none | moved KEEP→REVIEW |
| `pot_node_role_assignment.md` | KEEP | Core: PoT weight-based role assignment within NodeChain. Clean. | none | none |
| `pot_slashing_conditions.md` | REVIEW-KETEVAN | Whole file is slashing-against-a-held-stake: 'Slash Amount = stake * severity_factor' and burnStake(node, slashAmt) with 25%/50%/100% stake slashes. Presupposes and penalizes a held stake balance — a held-circulating-supply / born… [re-audit: CUT] | none | moved KEEP→REVIEW |
| `pot_tx_incentive_distribution.md` | REVIEW-KETEVAN | Load-bearing firewall term: 75/25 split routes 25% commission to "AFC reserve"/SYSTEM_AFC_RESERVE — AFC ownership share is a FORK; AFC in identifiers must not be auto-stripped; also unresolved PR #72 provenance note. | AFC@15, AFC@22, AFC@35, AFC@51, AFC@61 | N/A (REVIEW-KETEVAN: AFC-reserve 25% share is an ownership fork; do not resolve) |
| `pot_tx_signature_model.md` | KEEP | Core multi-sig PoT attestation, ECDSA, NodeChain quorum. Clean. | none | none |
| `pot_tx_validation_logic.md` | REVIEW-KETEVAN | Speak-as-a-role org-model contamination (category 4): 'As Regulatory Strategist, validation includes AML flags for compliance.' A professional role speaking/emitting a design decision — the prohibited persona org model, distinct f… | none | moved KEEP→REVIEW |
| `pot_tx_weighting_model.md` | KEEP | Core PoT weighting formula, NodeChain load/context. Clean. | none | none |

### `11_node_security_and_payments/`
_9 files — KEEP 0 · CUT 1 · REVIEW 8_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `README.md` | REVIEW-KETEVAN | Module thesis is the prohibited held-supply staking model as load-bearing: enforces 'the "PoT Activity + Security Deposit" rule, ensuring that all participants have "skin in the game"' and handles 'deposit locking' and 'punitive f… | none | moved KEEP→REVIEW |
| `deposit_compliance.md` | CUT | Entire document is ALB-epoch "own bank" model: deposits held off-chain at the Authorized Liquidity Bridge (ALB), denominated in AFC, "AFC THESIS 5", external financial processing; asserts NodeChain does NOT manage assets (contradi… | ALB@1, ALB@5, AFC@8, ALB@10, AFC@16, ALB@16, ALB@17, ALB@25, AFC@31 | N/A (CUT) |
| `deposit_forfeiture_rules.md` | REVIEW-KETEVAN | Whole file forfeits/burns held validator deposits ('burn_amount = validator_deposit x penalty_ratio') and adds vote-weighted governance slashing ('Governance Slash — via governance override vote', 'Manual forfeit requires >=66% va… [re-audit: CUT] | none | moved KEEP→REVIEW |
| `deposit_freeze_unlock_rules.md` | REVIEW-KETEVAN | Whole file is the locked-collateral lifecycle: 'Deposit funds are treated as locked collateral — bound to validator duties and performance — and cannot be freely moved,' with freeze/unlock/withdraw of held deposits. Held-circulati… [re-audit: CUT] | none | moved KEEP→REVIEW |
| `deposit_governance_interface.md` | REVIEW-KETEVAN | Token-weighted governance controlling emission: 'Governance Token Required / Yes (1 vote = 1 GOVTKN)' voting that per the overview affects 'emission parameters,' plus adjustEpochParameters()/epoch/modify. This is governance-vote m… [re-audit: CUT] | none | moved KEEP→REVIEW |
| `node_epoch_commitments.md` | REVIEW-KETEVAN | Mandatory held deposit bound to epochs (held-circulating-supply / lockup): 'Min Deposit 10,000 AROS', 'Deposit Lock Activated', 'Early withdrawals are forbidden unless triggered by governance override.' Epoch scheduling kernel may… | none | moved KEEP→REVIEW |
| `node_performance_score.md` | REVIEW-KETEVAN | Otherwise canon-aligned work/reputation score, but wired to the held-stake model: tier outcome '<0.30 -> 0x (No payment), Immediate Slash', 'unlock security deposit benefits', and 'Score weights are adjustable via governance vote.… | none | moved KEEP→REVIEW |
| `node_registration.md` | REVIEW-KETEVAN | Participation gated on a locked deposit (held-circulating-supply / lockup-to-participate): 'Deposit Commitment >= 10,000 AROS' and 'Node Security Deposit Contract / deposit() / Locks required AROS.' Node onboarding is canon, but t… | none | moved KEEP→REVIEW |
| `payment_distribution_engine.md` | REVIEW-KETEVAN | Post-factum payout core is canon, but contaminated by: 'Deposit Weight — Validator's deposit relative to total active deposit' as a payment component (stake-weighted yield / lockup-for-yield), 'Base Epoch Payment — Fixed emission … | none | moved KEEP→REVIEW |

### `12_nodechain_ai_agents/`
_19 files — KEEP 9 · CUT 0 · REVIEW 10_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `README.md` | REVIEW-KETEVAN | Index/entry of the role-team AI-agents module (Observer→Analyzer→Trigger role team; "Responsible Team"); links role matrix | role@18 (roles-matrix link) | N/A (REVIEW-KETEVAN) |
| `agent_architecture.md` | REVIEW-KETEVAN | Framework for the role-team model: role-scoped autonomous agents with Observe/Analyze/Act/Log lifecycle that INITIATE actions (slashing/suspension); multi-agent role consensus | Anchor@21,79 (benign hash-anchor); role@118 | N/A (REVIEW-KETEVAN) |
| `agent_roles_matrix.md` | REVIEW-KETEVAN | PRIME SUSPECT: explicit "team of N roles, each emits an action" model (OBS/BEHAV/FRAUD/DISP/GOV/AUDIT/META agents with role-scoped Output Action + Escalation Target); role-emission model is CUT-epoch but must be flagged not auto-c… | role@1,3,5 (pervasive); Anchor@95 ("Anchor Loggers", benign hash-anchor) | N/A (REVIEW-KETEVAN); do not auto-strip role matrix — pending role-model decision |
| `ai_governance_escalation.md` | REVIEW-KETEVAN | Role-agents emit escalations/overrides to governance; coupled to role model | none ("anchor validators"@22 lowercase, benign) | N/A (REVIEW-KETEVAN) |
| `anomaly_detection_engine.md` | KEEP | Canon KEEP concept (anomaly detection engine); primary content is detection pipeline/scoring | none | @25 (external-oracle ingestion: "exchange spikes, fee volatility, geopolitical alerts" = e… |
| `audit_trace_emitter.md` | REVIEW-KETEVAN | Audit/anchor concept but content is entirely the emission ledger of role-agent decisions (FRAUD-AI slashStake) — coupled to role-team | none (lowercase "anchor" benign) | N/A (REVIEW-KETEVAN) |
| `consensus_dispute_resolver.md` | REVIEW-KETEVAN | Arbitration among conflicting role-agent emissions; part of role-team model | none (lowercase "anchor" benign) | N/A (REVIEW-KETEVAN) |
| `fraud_signal_dispatcher.md` | REVIEW-KETEVAN | Role-emission: dispatches to role-agents (FRAUD/GOV/DISP), states "role separation"; also corrupted "Fee Distribution" wording (@88) | role@14; Anchor@84 (benign) | N/A (REVIEW-KETEVAN) |
| `meta_learning_feedback_loop.md` | REVIEW-KETEVAN | Recalibrates role-agents; depends on agent_roles_matrix.md; role-model coupling (invariant "post-factum"@44 present, KEEP-worthy but coupled) | role@94 (roles-matrix link) | N/A (REVIEW-KETEVAN) |
| `requirements.txt` | KEEP | ML/detection stack (torch, scikit-learn, pandas, numpy, fastapi) | none | consider @1 langchain (LLM-agent/role framework) — verify not pulling role-team model |
| `src/agent_base.py` | KEEP | Abstract base (analyze + audit-hash); clean OOP, no role-team model | Anchor@24 (benign "Decision Anchored" hash log) | none |
| `src/anomaly_detection_engine.py` | KEEP | Real anomaly detection engine (sklearn IsolationForest); does NOT encode role-team model | none | none |
| `src/main.py` | KEEP | FastAPI wiring for ADE + meta agent; no role-team encoding | none | none |
| `src/meta_learning.py` | KEEP | Post-factum feedback recalibration agent; forward-only, no role-emission model | none | none |
| `src/schemas.py` | KEEP | Pydantic tx/validator/analysis schemas; neutral | none | none |
| `tests/test_ade.py` | KEEP | Pytest for anomaly detection engine | none | none |
| `tests/test_ade_unittest.py` | KEEP | unittest for anomaly detection engine | none | none |
| `tx_pattern_recognition.md` | REVIEW-KETEVAN | Anomaly/pattern detection (KEEP-worthy core) BUT expressed as a role-agent (TXPAT-AI) emitting to FRAUD/GOV/DISP; depends on agent_roles_matrix.md | role@111; Anchor@99 (benign) | N/A (REVIEW-KETEVAN) — salvage pattern catalog after role-model decision |
| `validator_behavior_monitor.md` | REVIEW-KETEVAN | Role-agent (BEHAV-AI) emits behavior_alert / escalates to PAYMENT-CORE/FRAUD-AI; depends on agent_roles_matrix.md | passive@75 (benign "passive penalty"); role@110; Anchor@98 (benign) | N/A (REVIEW-KETEVAN) |

### `13_extra_supervisory_layer/`
_7 files — KEEP 0 · CUT 0 · REVIEW 7_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `README.md` | REVIEW-KETEVAN | CANON CONTRADICTION: All-Seeing Eye described as "passive ... without interfering", "Reads internal events without execution rights" — canon says the Eye HAS veto; also corrupted "Signal Fee Distribution" wording (@9); only exists… | passive@4 | N/A (REVIEW-KETEVAN) — reconcile veto vs passive |
| `anomaly_detection_patterns.md` | REVIEW-KETEVAN | Anomaly-pattern catalog (KEEP-worthy) but part of passive-Eye model and is a FORK (extra §7 ML ML-401/402); unresolved fork must not be resolved | role@31 (role delegation recursion) | N/A (REVIEW-KETEVAN) — salvage pattern catalog after fork resolved |
| `integrity_signal_emission.md` | REVIEW-KETEVAN | CANON CONTRADICTION: "without enforcing any action"@5, "cannot trigger state changes"@49, "do not command or intervene — they inform"@132; corrupted "Fee Distribution"@43,46,53; FORK (extra §6 RabbitMQ/Telegram/Grafana) | passive@83; role@34 | N/A (REVIEW-KETEVAN) |
| `meta_event_logging_protocol.md` | REVIEW-KETEVAN | CANON CONTRADICTION: "It cannot act — only witness and write"@144; FORK (extra §8 Arweave/Filecoin/zk-SNARKs; "block" units) | passive@51 ("passive alert") | N/A (REVIEW-KETEVAN) |
| `observation_scope_and_limits.md` | REVIEW-KETEVAN | CANON CONTRADICTION: strictly read-only "limited-scope auditor, not a universal observer", no state/veto power implied — contradicts Eye-HAS-veto; FORK (differs @1,32) | role@15 (role grants); Anchoring@18 (benign) | N/A (REVIEW-KETEVAN) |
| `observer_node_interface.md` | REVIEW-KETEVAN | Passive-observer model (nodes "do not vote/execute/trigger state changes"); FORK w/ CUT-epoch external-crypto debris: Solidity staking@108, on-chain@110, Sepolia testnet@111, AST-token stake@107 | none in grep-list (epoch debris: Solidity@108, Sepolia@111, stake@107) | N/A (REVIEW-KETEVAN) — strip external-crypto/smart-contract §7 if salvaged |
| `the_all_seeing_eye_overview.md` | REVIEW-KETEVAN | CANON CONTRADICTION: "never commands"@39, "cannot override governance decisions"@62, "witness, not judge"@64, "does not participate in consensus or vote"@29 — contradicts Eye-HAS-veto; FORK vs ast/ (differs @1,39,60,84-88) | passive@5,37; role@64,72 | N/A (REVIEW-KETEVAN) |

### `ast/`
_6 files — KEEP 0 · CUT 0 · REVIEW 6_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `extra_supervisory_layer/anomaly_detection_patterns.md` | REVIEW-KETEVAN | Same catalog; FORK counterpart (Summary "Eye doesn't evaluate intent — only deviation"@106 reinforces passive/no-veto contradiction; "snapshot" units) — not byte-identical | role@31 | N/A (REVIEW-KETEVAN) |
| `extra_supervisory_layer/integrity_signal_emission.md` | REVIEW-KETEVAN | Same CANON CONTRADICTION (non-binding/inform-only, no veto); FORK counterpart (correct "Emission" wording, trimmed) — not byte-identical | role@34; passive@17 ("Passive structural health") | N/A (REVIEW-KETEVAN) |
| `extra_supervisory_layer/meta_event_logging_protocol.md` | REVIEW-KETEVAN | Same CANON CONTRADICTION (cannot act, witness-only); FORK counterpart ("snapshot/batch" units, trimmed) — not byte-identical | passive@50 ("passive alert") | N/A (REVIEW-KETEVAN) |
| `extra_supervisory_layer/observation_scope_and_limits.md` | REVIEW-KETEVAN | Same CANON CONTRADICTION (read-only, no veto); FORK counterpart (title-cased, trimmed consensus line) — not byte-identical | role@15; Anchoring@18 (benign) | N/A (REVIEW-KETEVAN) |
| `extra_supervisory_layer/observer_node_interface.md` | REVIEW-KETEVAN | Same passive-observer model; FORK counterpart (trimmed — no Solidity/Sepolia §7) — not byte-identical | none | N/A (REVIEW-KETEVAN) |
| `extra_supervisory_layer/the_all_seeing_eye_overview.md` | REVIEW-KETEVAN | Same CANON CONTRADICTION (passive/"witness, not judge"/never commands); FORK counterpart of 13_ (trimmed, "Signal Emission Only"@39) — not byte-identical | passive@5; role@64,72 | N/A (REVIEW-KETEVAN) |

### `14_decentralized_tx_encoding/`
_5 files — KEEP 2 · CUT 0 · REVIEW 3_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `README.md` | KEEP | DTE overview feeding PoT pipeline; distributed encoding quorum; no firewall terms | none | none |
| `decentralized_tx_encoding.md` | REVIEW-KETEVAN | Section 6 Sybil-resistance asserts 'Encoding nodes require staking and PoT reputation score >=0.8.' Required staking = held/locked bond for participation, a prohibited held-supply/lockup mechanism; canon achieves Sybil resistance … | none | moved KEEP→REVIEW |
| `dte_governance_upgradability.md` | REVIEW-KETEVAN | Section 4.3 sets the Validator Assembly approval threshold at '>= 67% of total stake' - stake/token-weighted on-chain governance presupposing held/locked stake. Contradicts canon (no token-weighted governance; node influence = wor… | none | moved KEEP→REVIEW |
| `dte_security_threat_models.md` | REVIEW-KETEVAN | Section 3.3 mitigation asserts 'Security Deposit-slash penalties for proven malicious consensus participation' - a posted, slashable security deposit is held/locked collateral (held circulating supply), a Model-A staking/slashing-… | none | moved KEEP→REVIEW |
| `dte_testing_benchmarking.md` | KEEP | DTE test/benchmark methodology; PostgreSQL 15 matches canon toolchain; no firewall terms | none | L105 Russian authoring chatter; L66 "TypeScript/Go" — Go is outside canon toolchain (NestJ… |

### `docs/`
_67 files — KEEP 20 · CUT 11 · REVIEW 36_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `AST_Developer_Deep_Dive.md` | REVIEW-KETEVAN | Load-bearing AFC references in intro ("Unlike AFC", "AFC as signed API contract", "original AFC Deep Dive") + pervasive Model-A/ALB-epoch content (fiat+external-crypto bridge tokenization, 1:1 reserve backing, dynamic-fee emission… | AFC@5, AFC@7 | N/A (REVIEW) |
| `README.md` | CUT | ALB-epoch documentation index (Swiss-Watch institutional finance, mandatory Bridge fiat gateway, KYC tokenization, proof-of-processing, AI supervisory); no surviving core canon, no AFC. | ALB@12 | N/A (CUT) |
| `adr/ADR-001-Network_Consensus_Model.md` | REVIEW-KETEVAN | Forbidden vocabulary: L29 'aligning **incentives** with network work.' Canon uses payment-for-executed-work, not incentive framing. Surface for reword. | none | moved KEEP→REVIEW |
| `adr/ADR-002-AI_Supervisory_Framework.md` | KEEP | Defines the All-Seeing-Eye AI supervisory federation (Modules 12/13): anomaly detection, validator monitoring, meta-audit; core, firewall-clean | roles@14,15 (benign: AI agent roles) | none |
| `adr/ADR-003-Regulatory-Compliance-Bridge.md` | CUT | Whole ADR justifies the mandatory fiat compliance bridge ("merging with fiat", fiat-to-crypto tokenization gateway); ALB-epoch fiat/banking rationale with no PoT-core content | fiat@5,13; Bridge Layer/Module 05@8 | N/A (CUT) |
| `adr/ADR-004-Network-Sharding-Strategy.md` | KEEP | State/transaction sharding for the NodeChain: state partitioning, parallel shard processing, local quorum consensus, cross-shard finalization; core, firewall-clean | none | none |
| `adr/ADR-005-Emergency-Governance-Procedures.md` | REVIEW-KETEVAN | Whole file is a Model-A governance 'circuit-breaker/stop-button.' Every load-bearing mechanism is prohibited: 'freezing token contracts' (token_lock_unlock_rules -> held/locked supply), 'initiating emission rollbacks' (emission_ro… [re-audit: CUT] | none | moved KEEP→REVIEW |
| `adr/ADR-006-Multi-Layered-Audit-Trail.md` | REVIEW-KETEVAN | Layer 2 'Token Trail' asserts the protocol-level token operations are 'Mint, Burn, Lock, and Freeze.' Lock/Freeze are first-class token operations implying held/frozen circulating supply, contradicting born-and-burned (only PoT-mi… | none | moved KEEP→REVIEW |
| `api/ALB_AST_API.md` | CUT | Entire document is the ALB (Aros Logic Bridge) → AST API; deprecated pointer stub whose sole subject is firewall-forbidden ALB | ALB@1; ALB@5 | N/A (CUT) |
| `api/AST_API_Spec.md` | REVIEW-KETEVAN | Account balance response exposes a 'locked':'500.000000000' sub-balance, asserting held/locked circulating supply. Contradicts born-and-burned canon (tokens minted only via PoT and burned atomically; earned value retained, no lock… | none | moved KEEP→REVIEW |
| `api/module_02_nodechain.md` | REVIEW-KETEVAN | The /consensus/epoch/current response hardcodes a supply cap: 'maxSupply':'1000000000.000000000' alongside 'minted' (Data_Model.md confirms maxSupply = 'total supply cap'). A governance/protocol-fixed max supply contradicts the ca… | none | moved KEEP→REVIEW |
| `api/module_05_bridge.md` | CUT | Entire document is the fiat Bridge API — KYC submit, tokenize fiat, reverse-tokenize to fiat bank IBAN; the fiat/banking tokenization gateway of the ALB epoch | fiat@44,48,50,61; bank@9,82 (partner bank / bank IBAN) | N/A (CUT) |
| `api/module_12_ai_agents.md` | KEEP | AI Supervisory (All-Seeing-Eye) API: transaction/account risk scoring, fraud-signal subscribe, immutable meta-audit trace; core, firewall-clean | none | none |
| `api/openapi.yaml` | REVIEW-KETEVAN | Public (tx) and AI-supervision paths are clean core, but the spec's info.description and tags name "Bridge API (ALB)" and the /kyc + /bridge/tokenize fiat paths are load-bearing ALB identifiers in the schema header — needs surgery… | ALB@8; ALB@20; fiat@152; bridge/kyc paths@105-162 | Defer: remove Bridge tag@19-20, ALB text@8, paths 105-162; keep tx & ai paths |
| `architecture/AST_AFC_Interface.md` | CUT | Empty file whose entire identity is the AST↔AFC interface; dedicated firewall artifact with zero salvageable core content | AFC@filename (0-byte body) | N/A (CUT) |
| `architecture/Architecture_Overview.md` | REVIEW-KETEVAN | Core module list + TX lifecycle + emission epochs are canon, but Section 2 "System Boundaries (AST vs ALB)" is a whole load-bearing section defining AST/fiat/ALB boundary; also BTC/ETH ingestion module and Bridge data-flow woven t… | liquidity pools@18; ALB@20; fiat@20,44,58; BTC/ETH@28; ALB@50,52 (banks); ALB@74 | Defer: would require deleting Section 2 (42-58), Module 05 line 19-20, Module 09 line 27-2… |
| `architecture/Module_Map.md` | REVIEW-KETEVAN | Module table is mostly core (NodeChain, PoT, token mgmt, All-Seeing-Eye), but rows 04/05/09 embed ALB, fiat, wBTC as numbered structural modules referenced elsewhere; removing them breaks module numbering — not clean | liquidity@12; ALB@13; fiat@13; wBTC@17 | Defer: rows 05 & 09 are structural; edit "internal liquidity mechanisms"@12 |
| `architecture/sequence_diagrams.md` | REVIEW-KETEVAN | Diagram 1 (Standard TX Lifecycle, 7-78) is clean core; but the file forks into Diagram 2 (80-129) which is the fiat/ALB tokenization flow and names AFC explicitly — hard firewall term in a load-bearing diagram, unresolved fork | fiat@80; AFC@82; ALB@94 (Mod_05_ALB) | Defer (fork): keep Diagram 1 (7-78); Diagram 2 (80-129) is ALB/AFC — do not auto-strip |
| `architecture_team_roles.md` | CUT | The "team of roles / owning-team" org model itself (firewall CUT epoch); also names ALB, external crypto ingestion, and liquidity as team charters | team-of-roles@title,1,24-70; ALB@42; external crypto ingestion@15; liquidity@10 | N/A (CUT) |
| `conceptual/AST_Whitepaper.md` | REVIEW-KETEVAN | Firewall-framed thesis: AST defined as "Phase 1" foundation built to service "Phase 2" AFC; plus ALB-epoch framing (mandatory Bridge fiat gateway, KYC tokenization, proof-of-processing, central-bank mimicry). Load-bearing AFC in d… | AFC@11, AFC@53 | N/A (REVIEW) |
| `data/Data_Model.md` | REVIEW-KETEVAN | epoch.schema defines maxSupply as 'the total supply cap' and says epochs 'control network-wide events, such as emission' (time/epoch-driven, governance-capped emission) which violates canon 'emitted ONLY via PoT' and 'supply deriv… | none | moved KEEP→REVIEW |
| `development_guide.md` | KEEP | Generic local dev setup: git/node/docker, build/run, unit/integration/e2e test commands; no firewall identifiers (repo dir name only; "Tokenization flow"@96 is a generic test example) | none | none |
| `glossary.md` | REVIEW-KETEVAN | AFC defined as a glossary term (firewall term in a definition — must not auto-strip) + canon contradiction (All-Seeing-Eye defined "passive", canon HAS veto); mixed with core terms (Node/Nodechain/Quorum/Shard). | AFC@9, ALB@15, AFC@71, passive@61,81 | N/A (REVIEW) |
| `legal/Intellectual_Property.md` | REVIEW-KETEVAN | Empty 0-byte legal stub; no positive content to classify — Ketevan decides fill vs drop | none (empty) | N/A (review) |
| `legal/Legal & Compliance Commentary .md` | REVIEW-KETEVAN | Legal/compliance text with firewall hits; never auto-strip legal language | fiat@8, ALB@8 | N/A (review) |
| `legal/Legal Commentary on Asset Backing & Double Issuan.md` | REVIEW-KETEVAN | Named-in-note AFC-custody + fiat-reserve legal doc; load-bearing AFC/ALB/custody framing | fiat@9, ALB@9, AFC@33, custody@33, AFC@53, custodial@53, ALB@75, AFC@77 | N/A (review) |
| `legal/Patent-Filing-Receipt.md` | REVIEW-KETEVAN | Patent identifier docket AFC-AP1080825; never strip firewall term from legal identifier | AFC@12 | N/A (review) |
| `legal/Patent-Modular-Architecture-Summary.md` | REVIEW-KETEVAN | Patent claims content with load-bearing ALB (Aros Logic Bridge) + fiat/crypto framing | fiat@9, ALB@11, fiat@14, ALB@21 | N/A (review) |
| `legal/Patent_References.md` | REVIEW-KETEVAN | Empty 0-byte legal/patent stub; no content to classify — Ketevan's domain | none (empty) | N/A (review) |
| `legal/Principles & Paradigm.md` | REVIEW-KETEVAN | Named-in-note "AFC microservice system" doc; contains LacMusa + AFC + fiat | AFC@5, AFC@18, fiat@43, LacMusa(Lac Musa)@81 | N/A (review) |
| `legal/README.md` | REVIEW-KETEVAN | Legal directory index framing patent around ALB (Aros Logic Bridge); legal text, no auto-strip | ALB@17, ALB@24 | N/A (review) |
| `operations/Runbook.md` | KEEP | Operator SOPs: monitoring, emergency halt (ADR-005), consensus-fork response, coordinated node upgrade; core ops with one strippable Bridge-Layer reference | Bridge Layer@23 | Line 23: strip "the Bridge Layer (Module 05) and" from the halt scope |
| `processing/ArosCoin Conversion and Custodial Logic – Official.md` | CUT | Explicitly the "Official AFC Model"; describes ArosCoin as 1:1 asset-backed by ingested BTC/ETH/fiat held in ALB/vault custody — directly contradicts canon (ArosCoin PoT-only, born-and-burned) and is saturated with firewall terms | AFC@1,5; BTC/ETH/USDT@19; ALB@19,59; liquidity pool@19; bank@59 | N/A (CUT) |
| `processing/Processing_Spec.md` | KEEP | Processing Layer (Module 07) pipeline: ingestion/queue, validation, AI risk check, batching/dispatch to consensus, journal to audit trail, rollback; core, firewall-clean | none | none |
| `processing/README.md` | REVIEW-KETEVAN | Frames the directory as covering 'conversion, and custodial logic' and describes the ArosCoin Conversion doc as 'Official procedures for converting fiat/crypto to ArosCoin, ensuring asset-backed issuance' — external crypto/fiat in… | none | moved KEEP→REVIEW |
| `requirements/SRS_AST.md` | REVIEW-KETEVAN | Firewall-framed: AST defined as platform to service AFC; ALB-epoch (Bridge/KYC gateway, tokenization/detokenization, AI fraud). Load-bearing AFC in definitions/scope. | AFC@13, AFC@26, AFC@31 | N/A (REVIEW) |
| `requirements/schemas/audit_log_entry.schema.json` | KEEP | Generic audit-trail schema; core actions (MINT/BURN/GOVERNANCE_VOTE); no firewall term. Enum carries CUT bridge actions. | none | Remove enum values TOKENIZE, REVERSE_TOKENIZE @26-27 (bridge/fiat) |
| `requirements/schemas/bridge_request.schema.json` | CUT | Entire schema is the fiat<->crypto Bridge request (TOKENIZE/REVERSE_TOKENIZE, fiatAccountId/IBAN, kycDecision, signedByALB) — CUT epoch (fiat/bridge/ALB/tokenization). | ALB@45, ALB@59 | N/A (CUT) |
| `requirements/schemas/epoch.schema.json` | KEEP | Generic epoch schema (epochId/startTime/duration/shards); no firewall/fork. | none | Reconcile maxSupply @23 (canon: no supply cap, supply derivable) and shards @33 (ALB scala… |
| `requirements/schemas/risk_score.schema.json` | KEEP | Anomaly/risk-score object maps to All-Seeing-Eye deviation scoring; only defect is ALB in source enum (CUT term, strippable). | ALB@32 | Remove "ALB" from source enum @32 |
| `requirements/schemas/transaction.schema.json` | KEEP | Clean canonical transaction schema; potWeight = Proof-of-Transaction; no firewall/fiat/bridge. | none | none |
| `security/GDPR_KVKK_Controls.md` | REVIEW-KETEVAN | Empty 0-byte stub in KEEP-topic area; unsure (fill vs drop) | none (empty) | N/A (review) |
| `security/Security_Standard.md` | REVIEW-KETEVAN | Core Principle #3 makes 'All value entering or exiting the platform must pass through the Regulatory Compliance Bridge (ADR-003)' a mandatory invariant (fiat/custody value in/out bridging as load-bearing); also a smart-contract To… | none | moved KEEP→REVIEW |
| `security/ZeroTrust_Compliance.md` | REVIEW-KETEVAN | Empty 0-byte stub (KEEP-topic title); no positive content to classify | none (empty) | N/A (review) |
| `specs/AST_AllSeeingEye_AGENT_EN.md` | REVIEW-KETEVAN | Load-bearing firewall term LacMusa (AFC) in the overseer comparison AND canon contradiction: spec asserts Eye is strictly passive / has NO veto, canon says Eye HAS veto. Do not resolve. | LacMusa@12, AFC@12, veto@12, passive@3,7,12,27,33 | N/A (REVIEW) |
| `specs/AST_ArosCoin_AGENT_EN.md` | KEEP | Clean core canon: process unit, born-and-burned dual fate, PoT-gated origin, earned retention; no AFC. | passive@69 | Reword L69 "passive oversight" (canon: Eye HAS veto) |
| `specs/AST_Commission_AGENT_EN.md` | REVIEW-KETEVAN | Unresolved fork: commission_part minted in ArosCoin OR charged in value ("Ketevan decision"). Core otherwise clean (post-factum, PoT-gated). Do not resolve fork. | zones/fork@69-70, passive@73 | N/A (REVIEW) |
| `specs/AST_Emission_AGENT_EN.md` | REVIEW-KETEVAN | Unresolved fork: commission_part form (mint in ArosCoin vs charge in value, "Ketevan decision"). Core clean (PoT-only mint/burn, supply derivable). Do not resolve fork. | zone@16,36, zones@70-71, passive@74 | N/A (REVIEW) |
| `specs/AST_NodeChain_AGENT_EN.md` | KEEP | Clean core canon: append-only chain, hash continuity, mandatory state recording (P3); no AFC. | passive@92 | Reword L92 "passive oversight" (Eye HAS veto) |
| `specs/AST_Nodes_AGENT_EN.md` | KEEP | Clean core canon: post-factum payment, reputation-weighted, no staking; no AFC. | passive@71 | Reword L71 "passive oversight" (Eye HAS veto) |
| `specs/AST_Ontology_FULL_AGENT_EN.md` | REVIEW-KETEVAN | Declares standalone/no-AFC but retains multiple unresolved AFC/Model-A [ZONE] forks (Bridge Layer, 100% backing, tokenization, Anchor conversion fees, "via AFC" reframes). Do not resolve forks. | AFC@174, AFC@188, Anchor@98, [ZONE]@49,51,135,137,253 | N/A (REVIEW) |
| `specs/AST_PoT_AGENT_EN.md` | KEEP | Clean core canon: PoT verdict gates value/emission/payment; PoW/PoS text is clarifying comparison; no AFC. | passive@94 | Reword L94 "passive oversight" (Eye HAS veto) |
| `specs/AST_Release_AGENT_EN.md` | KEEP | Clean core canon: maturity-gated circulation (P7), reserveIndex/velocity thresholds; no AFC. | passive@54 | Reword L54 "passive oversight" (Eye HAS veto) |
| `specs/AST_Reserve_AGENT_EN.md` | REVIEW-KETEVAN | Unresolved Model-1/Model-A fork: own capitalization vs custodial 100% asset backing (= cut fiat-anchor concept). Do not resolve fork. | zones@42-43, passive@46 | N/A (REVIEW) |
| `specs/AST_StateRecording_AGENT_EN.md` | KEEP | Clean core canon: event-completeness enforcement, causal order, audit trail (P3); no AFC. | passive@71 | Reword L71 "passive oversight" (Eye HAS veto) |
| `standards/Coding_Standards.md` | KEEP | Firewall-clean coding standards; stack-relevant | none | none |
| `standards/Contribution_Guide.md` | KEEP | Firewall-clean contribution/process guide; stack-relevant | none | none |
| `standards/Logging_Conventions.md` | REVIEW-KETEVAN | Empty 0-byte stub (KEEP-topic title); no positive content | none (empty) | N/A (review) |
| `standards/Security_Policy.md` | REVIEW-KETEVAN | Empty 0-byte stub; no positive content to classify | none (empty) | N/A (review) |
| `standards/ZeroTrust_Compliance.md` | REVIEW-KETEVAN | Empty 0-byte stub (duplicate KEEP-topic title); no content | none (empty) | N/A (review) |
| `testing/Test_Coverage_Map.md` | REVIEW-KETEVAN | Empty 0-byte stub; no positive content to classify | none (empty) | N/A (review) |
| `testing/Test_Strategy.md` | REVIEW-KETEVAN | The canonical E2E tokenization flow is '/kyc/submit -> /bridge/tokenize -> /account/balance -> Verify balance has increased' — a mint-on-deposit crypto/fiat bridge as the load-bearing user flow, contradicting canon (no external in… | none | moved KEEP→REVIEW |
| `testing_guide.md` | KEEP | Generic Jest/ts-jest testing guide: test types, running/coverage, mocks/fixtures; entirely firewall-clean | none | none |
| `tokenomics/README.md` | CUT | Index of ALB-epoch tokenomics (FX dynamic pricing, TVS/NRI, PoC redemption); superseded by canon specs, no core survives. | none | N/A (CUT) |
| `tokenomics/pricing_model.md` | CUT | Fiat FX-volatility dynamic PRICE model (price-stability) + emission tied to volume/utilization — contradicts PoT-only born-and-burned emission canon. | none | N/A (CUT) |
| `tokenomics/proofs.md` | CUT | Proof-of-Claim for reverse-tokenization/fiat redemption with KYC (bridge/fiat = CUT epoch). | none | N/A (CUT) |
| `tokenomics/validator_metrics.md` | KEEP | Node performance/reputation (TVS/NRI) and reputation-weighted payment distribution — core domain (nodes/commission); no firewall/fiat/ALB. | none | Reword "emission payments/distributing emission" (canon: nodes paid from commission pool; … |

### `src/`
_61 files — KEEP 47 · CUT 0 · REVIEW 14_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `AST-Aros-Financial-Paradigm.code-workspace` | KEEP | Firewall-clean workspace config | none | none |
| `all-seeing-eye/all-seeing-eye.module.ts` | REVIEW-KETEVAN | "passive supra-process meta-observation layer; never mutates state" — contradicts canon veto | passive@8 | REVIEW (do not strip) |
| `all-seeing-eye/all-seeing-eye.service.spec.ts` | REVIEW-KETEVAN | Asserts "passive witness (P6)" and forbids enforcement incl 'vote' — contradicts canon veto | passive@14, anchoring@122 | REVIEW (do not strip) |
| `all-seeing-eye/all-seeing-eye.service.ts` | REVIEW-KETEVAN | Eye defined as passive witness, "leaves authority over execution to other modules" — contradicts canon veto | passive@10, anchoring@103 | REVIEW (do not strip) |
| `all-seeing-eye/entities/oversight-log-entry.entity.ts` | REVIEW-KETEVAN | "Each entry is a passive observation... non-binding" — contradicts canon veto | passive@16, anchoring@34 | REVIEW (do not strip) |
| `app.controller.spec.ts` | KEEP | Firewall-clean health spec | none | none |
| `app.controller.ts` | KEEP | Firewall-clean health controller | none | none |
| `app.module.ts` | KEEP | Firewall-clean root module wiring (Postgres/NestJS core) | none | none |
| `aroscoin/aroscoin.module.ts` | KEEP | Firewall-clean module | none | none |
| `aroscoin/aroscoin.service.spec.ts` | KEEP | Firewall-clean unit ledger spec | none | none |
| `aroscoin/aroscoin.service.ts` | KEEP | Firewall-clean; ArosCoin born-and-burned via PoT, supply derived | none | none |
| `aroscoin/entities/aroscoin-ledger.entity.ts` | KEEP | Firewall-clean ledger entity | none | none |
| `commission/commission.module.ts` | REVIEW-KETEVAN | Module doc names "AFC Reserve" and addAfcAccrual routing | AFC@16, addAfcAccrual@17, AFC@18, AFC share@21 | REVIEW (do not strip) |
| `commission/commission.service.spec.ts` | KEEP | Firewall-clean (no AFC symbols; uses operationalMargin/margin) | none | none |
| `commission/commission.service.ts` | REVIEW-KETEVAN | MARGIN_RECIPIENT='AFC_RESERVE', 75/25 split, addAfcAccrual, reason 'afc_reserve' | MARGIN_RECIPIENT='AFC_RESERVE'@33, AFC@43,49,50,120,121,152,154, addAfcAccrual@1… | REVIEW (do not strip) |
| `commission/entities/epoch.entity.ts` | REVIEW-KETEVAN | Entity encodes 'AFC_RESERVE' recipient, 'afc_reserve' reason, afcMargin reconciliation | AFC_RESERVE@15, afc_reserve@19, AFC Reserve@31, afcMargin@32 | REVIEW (do not strip) |
| `common/clock.service.spec.ts` | KEEP | Firewall-clean clock spec | none | none |
| `common/clock.service.ts` | KEEP | Firewall-clean deterministic clock | none | none |
| `common/common.module.ts` | KEEP | Firewall-clean global module | none | none |
| `common/hash.util.spec.ts` | KEEP | Firewall-clean hash util spec | none | none |
| `common/hash.util.ts` | KEEP | Firewall-clean sha256/log10 primitives | none | none |
| `emission/emission.module.ts` | KEEP | Firewall-clean PoT-gated emission module | none | none |
| `emission/emission.service.spec.ts` | REVIEW-KETEVAN | Asserts afcShare = commission × 25% | afcShare@165,166,168,169,180 | REVIEW (do not strip) |
| `emission/emission.service.ts` | REVIEW-KETEVAN | Canonical formula field afcShare + "25% → AFC reserve" | AFC reserve@104, afcShare@104,110,117 | REVIEW (do not strip) |
| `invariants/invariants.spec.ts` | REVIEW-KETEVAN | I10 asserts "the All-Seeing Eye is passive" (no veto) — contradicts canon | passive@257 | REVIEW (do not strip) |
| `main.ts` | KEEP | Firewall-clean bootstrap | none | none |
| `nodechain/dto/append-event.dto.spec.ts` | KEEP | Firewall-clean DTO spec | none | none |
| `nodechain/dto/append-event.dto.ts` | KEEP | Firewall-clean DTO | none | none |
| `nodechain/entities/execution-snapshot.entity.ts` | KEEP | Firewall-clean snapshot entity | none | none |
| `nodechain/nodechain.module.ts` | KEEP | Firewall-clean module | none | none |
| `nodechain/nodechain.service.spec.ts` | KEEP | Firewall-clean chain spec | none | none |
| `nodechain/nodechain.service.ts` | KEEP | Firewall-clean append-only chain | none | none |
| `nodes/dto/register-node.dto.spec.ts` | KEEP | Firewall-clean DTO spec | none | none |
| `nodes/dto/register-node.dto.ts` | KEEP | Firewall-clean DTO | none | none |
| `nodes/entities/node.entity.ts` | KEEP | Firewall-clean node entity | none | none |
| `nodes/nodes.module.ts` | KEEP | Firewall-clean module | none | none |
| `nodes/nodes.service.spec.ts` | KEEP | Firewall-clean nodes spec | none | none |
| `nodes/nodes.service.ts` | KEEP | Firewall-clean workforce registry (work+reputation, no stake) | none | none |
| `orchestrator/dto/run-process.dto.spec.ts` | KEEP | Firewall-clean DTO spec | none | none |
| `orchestrator/dto/run-process.dto.ts` | KEEP | Firewall-clean DTO | none | none |
| `orchestrator/metrics.controller.spec.ts` | KEEP | Firewall-clean metrics controller spec | none | none |
| `orchestrator/metrics.controller.ts` | KEEP | Firewall-clean metrics/finalize controller | none | none |
| `orchestrator/orchestrator.controller.spec.ts` | KEEP | Firewall-clean controller spec (mocked service) | none | none |
| `orchestrator/orchestrator.controller.ts` | KEEP | Firewall-clean thin HTTP controller | none | none |
| `orchestrator/orchestrator.module.ts` | KEEP | Firewall-clean module wiring | none | none |
| `orchestrator/orchestrator.service.spec.ts` | REVIEW-KETEVAN | All-Seeing-Eye asserted passive/does-not-change-state (canon says HAS veto) | passive@32, passive@192 | REVIEW (do not strip) |
| `orchestrator/orchestrator.service.ts` | REVIEW-KETEVAN | AFC accrual event reference AND All-Seeing-Eye described as passive/no-veto (canon says HAS veto) | reserve.afc.accrual@180; passive@69 (canon contradiction) | REVIEW (do not strip) |
| `pot/entities/pot-verdict.entity.ts` | KEEP | Firewall-clean verdict entity | none | none |
| `pot/pot.module.ts` | KEEP | Firewall-clean module | none | none |
| `pot/pot.service.spec.ts` | KEEP | Firewall-clean PoT spec | none | none |
| `pot/pot.service.ts` | KEEP | Firewall-clean PoT verdict engine (binary gate) | none | none |
| `release/entities/release-phase.entity.ts` | KEEP | Firewall-clean phase entity | none | none |
| `release/release.module.ts` | KEEP | Firewall-clean module | none | none |
| `release/release.service.spec.ts` | KEEP | Firewall-clean release spec | none | none |
| `release/release.service.ts` | KEEP | Firewall-clean maturity gate | none | none |
| `reserve/reserve.module.ts` | KEEP | Firewall-clean module (no AFC symbols; derives index from confirmed volume) | none | none |
| `reserve/reserve.service.spec.ts` | REVIEW-KETEVAN | Tests exercise AFC accrual path (addAfcAccrual, afcMargin, 25% share) | AFC@151,152,154,160,161, afc-base@156, afcMargin@162,166, addAfcAccrual@171 | REVIEW (do not strip) |
| `reserve/reserve.service.ts` | REVIEW-KETEVAN | Load-bearing AFC identifiers/event; fork whether 25% reserve is AST's own or external AFC | AFC@6, AFC@17, addAfcAccrual@18, AFC_ACCRUAL_EVENT='reserve.afc.accrual'@33, tot… | REVIEW (do not strip) |
| `state-recording/state-recording.module.ts` | KEEP | Firewall-clean module | none | none |
| `state-recording/state-recording.service.spec.ts` | KEEP | Firewall-clean recording spec | none | none |
| `state-recording/state-recording.service.ts` | KEEP | Firewall-clean event capture | none | none |

### `tests/`
_2 files — KEEP 2 · CUT 0 · REVIEW 0_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `e2e/app.e2e-spec.ts` | KEEP | Firewall-clean e2e HTTP suite | none | none |
| `jest-e2e.json` | KEEP | Firewall-clean jest config | none | none |

### `reference/`
_19 files — KEEP 16 · CUT 1 · REVIEW 2_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `ast-core/README.md` | REVIEW-KETEVAN | The All-Seeing Eye entity is described as 'passive oversight: observe->log->compare->signal' — strictly passive, signal-only, with no veto or enforcement. This contradicts the canon in which the All-Seeing Eye can veto (observes +… | none | moved KEEP→REVIEW |
| `ast-core/package-lock.json` | CUT | regenerable lockfile | not read (lockfile) | N/A |
| `ast-core/package.json` | KEEP | core manifest, firewall-clean | none | — |
| `ast-core/src/allSeeingEye.ts` | KEEP | All-Seeing-Eye observer, firewall-clean | none | — |
| `ast-core/src/aroscoin.ts` | KEEP | core AST token model (born-and-burned), firewall-clean | none | — |
| `ast-core/src/commission.ts` | REVIEW-KETEVAN | L9 load-bearing AFC comment "canonical 25% AFC share"; marginRate=0.25 ownership of 25% reserve is a fork — do not rename | AFC (L9) | 25% margin owner (fork — Ketevan reassigns, not me) |
| `ast-core/src/demo.ts` | KEEP | demo runner, firewall-clean | none | — |
| `ast-core/src/emission.ts` | KEEP | PoT-gated emission, firewall-clean | none | — |
| `ast-core/src/invariants.test.ts` | KEEP | invariant tests, firewall-clean | none | — |
| `ast-core/src/nodechain.ts` | KEEP | NodeChain core, firewall-clean | none | — |
| `ast-core/src/nodes.ts` | KEEP | node entities, firewall-clean | none | — |
| `ast-core/src/orchestrator.ts` | KEEP | flow orchestrator; L70 eye.observe('ledger_anchoring',…) = generic ledger anchoring, NOT AFC "Anchor" actor (false positive) | none (grep hit "anchoring" = generic) | — |
| `ast-core/src/pot.ts` | KEEP | Proof-of-Transaction engine, firewall-clean | none | — |
| `ast-core/src/release.ts` | KEEP | core, firewall-clean | none | — |
| `ast-core/src/reserve.ts` | KEEP | reserve accounting, firewall-clean | none | — |
| `ast-core/src/stateRecording.ts` | KEEP | append-only state capture, firewall-clean | none | — |
| `ast-core/src/types.ts` | KEEP | shared types, firewall-clean | none | — |
| `ast-core/src/util.ts` | KEEP | helpers, firewall-clean | none | — |
| `ast-core/tsconfig.json` | KEEP | TS config, firewall-clean | none | — |

### `smart_contracts/`
_68 files — KEEP 4 · CUT 63 · REVIEW 1_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `smart_contracts/{artifacts,typechain-types,cache}/**` (65 files) | CUT | generated build output (regenerable) | none | N/A |
| `contracts/ArosCoinReserveManager.sol` | REVIEW-KETEVAN | NO buyback/liquidity/price-floor (clean there), BUT mint()/burnWithReference() are owner-driven mint-on-fiat/crypto-deposit + burn-on-withdrawal — diverges from canon "ArosCoin emitted ONLY via PoT"; emission-ownership is a fork | none (grep clean; "fiat/crypto deposit" generic, not "Fiat/Crypto Anchor") | custodial mint-on-deposit path vs PoT-only emission (Ketevan's call) |
| `hardhat.config.ts` | KEEP | hardhat config, firewall-clean | none | — |
| `package-lock.json` | CUT | regenerable lockfile | not read (lockfile) | N/A |
| `package.json` | KEEP | contract manifest, firewall-clean | none | — |
| `scripts/deploy.ts` | KEEP | deploys ArosCoinReserveManager; core stack, firewall-clean ("eth" hits = ethers/getSigners hardhat lib) | none (ethers lib, false positive) | — |
| `tsconfig.json` | KEEP | TS config, firewall-clean | none | — |

### `frontend/`
_22 files — KEEP 0 · CUT 1 · REVIEW 21_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `.gitignore` | REVIEW-KETEVAN | (see grouped section above) | none | — |
| `README.md` | REVIEW-KETEVAN | default Vite/React readme; scope question | none | — |
| `eslint.config.js` | REVIEW-KETEVAN | frontend lint config; scope question | none | — |
| `index.html` | REVIEW-KETEVAN | Vite entry HTML; scope question | none | — |
| `package-lock.json` | CUT | regenerable lockfile | not read (lockfile) | N/A |
| `package.json` | REVIEW-KETEVAN | frontend manifest; scope question | none | — |
| `public/vite.svg` | REVIEW-KETEVAN | (see grouped section above) | none | — |
| `src/App.css` | REVIEW-KETEVAN | dashboard styles; scope question | none | — |
| `src/App.tsx` | REVIEW-KETEVAN | AST NodeChain dashboard (not generic scaffold); firewall-clean, but is a frontend in-scope for the clean AST infra repo? | none | frontend-in-scope decision (Ketevan) |
| `src/assets/react.svg` | REVIEW-KETEVAN | (see grouped section above) | none | — |
| `src/components/GovernancePanel.tsx` | REVIEW-KETEVAN | AST governance proposals; firewall-clean; scope question | none | — |
| `src/components/LedgerFeed.tsx` | REVIEW-KETEVAN | AST ledger feed; firewall-clean; scope question | none | — |
| `src/components/Navbar.tsx` | REVIEW-KETEVAN | dashboard nav; firewall-clean; scope question | none | — |
| `src/components/NodeList.tsx` | REVIEW-KETEVAN | AST node list; firewall-clean; scope question | none | — |
| `src/components/Overview.tsx` | REVIEW-KETEVAN | renders ledger height / validators / epoch; AST concepts, firewall-clean; scope question | none | — |
| `src/hooks/useData.ts` | REVIEW-KETEVAN | polls NestJS backend (nodechain/ledger/governance); real AST dashboard, firewall-clean; scope question | none | — |
| `src/index.css` | REVIEW-KETEVAN | dashboard styles; scope question | none | — |
| `src/main.tsx` | REVIEW-KETEVAN | React entrypoint; frontend-scope question | none | — |
| `tsconfig.app.json` | REVIEW-KETEVAN | frontend TS config; scope question | none | — |
| `tsconfig.json` | REVIEW-KETEVAN | frontend TS config; scope question | none | — |
| `tsconfig.node.json` | REVIEW-KETEVAN | frontend TS config; scope question | none | — |
| `vite.config.ts` | REVIEW-KETEVAN | Vite config; scope question | none | — |

### `tools/`
_3 files — KEEP 3 · CUT 0 · REVIEW 0_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `ast_logic_guard.py` | KEEP | canon-guard tool; encodes AST invariants (no-reward terminology, PoT must-have, non-speculative) NOT AFC invariants — firewall-clean | none | — |
| `prometheus/prometheus.yml` | KEEP | metrics scrape config, firewall-clean ("promETHeus" = false ETH hit) | none (false positive) | — |
| `spec_rules.json` | KEEP | spec for the guard; forbids reward/stake-to-validate, requires PoT — AST canon, NOT AFC invariants | none | — |

### `scripts/`
_7 files — KEEP 6 · CUT 0 · REVIEW 1_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `agents-status.ts` | KEEP | toolchain, firewall-clean | none | — |
| `check-prohibitions.sh` | KEEP | AST Model-1 prohibition gate; P4 forbids liquidityMining, P5 forbids mint-on-deposit — enforcement tool, firewall-clean ("anchored" comment + "liquidity" inside prohibition patterns = false positives) | none (false positives inside guard patterns) | — |
| `fix-angular-devkit.js` | KEEP | CI dep-fix script, firewall-clean | none | — |
| `fix-ci.ts` | KEEP | CI toolchain, firewall-clean | none | — |
| `nightly-audit.ts` | KEEP | toolchain audit, firewall-clean | none | — |
| `simulate_flow.ts` | REVIEW-KETEVAN | Forbidden vocabulary: L9 comment 'Fee Distribution: Trigger Epoch to distribute **rewards**.' Payment is not a reward. Reframe comment. | none | moved KEEP→REVIEW |
| `test_governance.ts` | KEEP | governance test harness, firewall-clean | none | — |

### `.github/`
_11 files — KEEP 10 · CUT 0 · REVIEW 1_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `ISSUE_TEMPLATE/bug_report.md` | KEEP | Issue template | none | none |
| `ISSUE_TEMPLATE/custom.md` | KEEP | Issue template | none | none |
| `ISSUE_TEMPLATE/feature_request.md` | KEEP | Issue template | none | none |
| `PULL_REQUEST_TEMPLATE.md` | KEEP | PR template | none | none |
| `workflows/agent-dispatcher.yml` | KEEP | CI agent-dispatch infra; firewall-clean | none | none |
| `workflows/ai-review.yml` | KEEP | CI infra; "role" is LLM message role, benign | role@43, role@69 (LLM API "role":"user") | none |
| `workflows/auto-fix.yml` | KEEP | CI infra; firewall-clean | none | none |
| `workflows/ci.yml` | KEEP | CI pipeline | none | none |
| `workflows/codeql.yml` | KEEP | Security scanning | none | none |
| `workflows/copilot-setup-steps.yml` | KEEP | CI setup | none | none |
| `workflows/nightly-audit.yml` | REVIEW-KETEVAN | Hard firewall term: audits "архитектурные инварианты AFC" | AFC@43, Role@45 | Strip/rename L43 "инварианты AFC"→AST Model-1 invariants; reframe L44-46 non-custodial/rol… |

### `ci_logs/`
_10 files — KEEP 0 · CUT 10 · REVIEW 0_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `ci_logs/**` (10 files) | CUT | epoch debris — CI run logs | none | N/A |

### `reports/`
_2 files — KEEP 0 · CUT 2 · REVIEW 0_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `logic_guard/ast_report.json` | CUT | epoch debris (logic_guard agent output, hard_fail run) | N/A (CUT) | N/A (CUT) |
| `logic_guard/ast_summary.md` | CUT | epoch debris (logic_guard agent output) | N/A (CUT) | N/A (CUT) |

### (repository root)
_43 files — KEEP 19 · CUT 11 · REVIEW 13_

| file | verdict | reason | firewall-hits | what-was-stripped |
|---|---|---|---|---|
| `.editorconfig` | KEEP | Toolchain config | none | none |
| `.env.example` | KEEP | Env template | none | none |
| `.eslintrc.json` | KEEP | Lint config | none | none |
| `.gitattributes` | KEEP | Git config | none | none |
| `.gitignore` | KEEP | Git config | none | none |
| `.nvmrc` | KEEP | Node version pin | none | none |
| `.prettierrc` | KEEP | Format config | none | none |
| `AGENTS.md` | KEEP | Generic commit/test/citation agent guidelines; no role-team model, no AFC | none | none |
| `AGENT_AUTOMATOR_REPORT.md` | CUT | epoch debris (agent-run report) | N/A (CUT) | N/A (CUT) |
| `AGENT_CHAIN_REPORT.md` | CUT | epoch debris (agent-run report) | N/A (CUT) | N/A (CUT) |
| `AGENT_CORE_REPORT.md` | CUT | epoch debris (agent-run report) | N/A (CUT) | N/A (CUT) |
| `AST_AGENT_TASKS.yaml` | REVIEW-KETEVAN | Per-task role: persona labels resemble role-team model | role@12,19,27,35,43,51,59,67,75,83,91,99 | Ketevan decide whether task role: persona metadata stays or is stripped |
| `AST_RULES.yaml` | REVIEW-KETEVAN | Load-bearing rules file (spec-flagged); encodes governance_to_role_based + names Model-A constructs as prohibitions | role@47 | Keep as-is (rules file explicitly allowed to retain firewall/construct terms); Ketevan con… |
| `CHANGELOG.md` | REVIEW-KETEVAN | Contains role-team persona framing ("As the Lead…As PR Director…As Patent Attorney") | role/as-a-role@3, role@49, role@122 | Strip role-persona framing L3/L49/L122 |
| `CLAUDE.md` | REVIEW-KETEVAN | Describes the All-Seeing Eye as strictly passive with no veto: 'All-Seeing Eye is passive: observe -> log -> compare -> signal. It must never change state, halt, vote, or enforce,' and 'AI agents -> passive observation aligned wit… | none | moved KEEP→REVIEW |
| `CODE_OF_CONDUCT.md` | REVIEW-KETEVAN | Role-team persona preamble wraps standard Contributor Covenant | role/as-a-role@3, role@92 | Strip persona preamble L3 and L92; keep clean Covenant body L9-L21 |
| `CONTRIBUTING.md` | REVIEW-KETEVAN | Role-team persona model throughout ("As Lead NodeChain Architect…As FinReg Legal Advisor…As Communications Architect") | role/as-a-role@3, role@22, role@49, role@131 | Strip role-persona framing L3/L5/L22/L49/L131; CBDC/central-bank framing optional |
| `Dockerfile` | KEEP | Build config | none | none |
| `LICENSE` | KEEP | Standard license file | none | none |
| `README.md` | REVIEW-KETEVAN | Describes old ALB epoch scope (Authorized Liquidity Bridge, custodian disclaimer, Value Circulation/Liquidity) | ALB@19, custodian@19, Liquidity@34 | Strip L19 ALB/"custodian/holds funds" regulatory disclaimer; strip/reword L34 "Value Circu… |
| `SECURITY.md` | KEEP | Standard security policy; no firewall hits | none | none |
| `VERSION` | KEEP | Version stamp "0.1.0" | none | none |
| `architecture_diagrams.md` | REVIEW-KETEVAN | ALB-epoch diagrams: Liquidity Pool + Buyback Mechanism + Liquidity Routing | liquidity@68, buyback@70, liquidity@84 | Strip diagram nodes L68 "Liquidity Pool", L70 "Buyback Mechanism", L84 "Liquidity Routing"… |
| `ci_logs.zip` | CUT | epoch debris | N/A (CUT) | N/A (CUT) |
| `deployment_guide.md` | REVIEW-KETEVAN | Entire document is an external-crypto / Ethereum-chain deployment guide built on cut-forever concepts: deploys ArosCoin as a Solidity contract to Sepolia/mainnet, requires MetaMask + testnet ETH, Alchemy/Infura, and Etherscan veri… [re-audit: CUT] | none | moved KEEP→REVIEW |
| `docker-compose.yml` | KEEP | Compose config | none | none |
| `economic_simulation.md` | REVIEW-KETEVAN | Future-work bullet references external BTC/ETH ingress | anchor@97 (matplotlib bbox_to_anchor, false-positive), BTC/ETH@147 | Strip L147 "multi-chain … ETH vs BTC ingress" future-work bullet; L97 is matplotlib, ignor… |
| `failed_job_names.txt` | CUT | epoch debris (6 bytes) | N/A (CUT) | N/A (CUT) |
| `failed_jobs.json` | CUT | epoch debris (59 bytes) | N/A (CUT) | N/A (CUT) |
| `fix_output.txt` | CUT | epoch debris | N/A (CUT) | N/A (CUT) |
| `full_ci_log.txt` | CUT | epoch debris | N/A (CUT) | N/A (CUT) |
| `glossary.md` | REVIEW-KETEVAN | Role-team persona preamble ("As PR Director…As Patent Attorney…as a role") | role/as-a-role@3, role@31, Anchor@35 | Strip L3 multi-role persona preamble; keep node "role assignment"@31; "Quorum Anchor"@35 i… |
| `jest.config.ts` | KEEP | Test config | none | none |
| `package-lock.json` | KEEP | Generated lockfile (toolchain) | none | none |
| `package.json` | KEEP | Manifest; ethers is core Solidity tooling | ethers@43 (benign) | none |
| `payment_rate` | CUT | epoch debris (empty stub, 0 bytes) | N/A (CUT) | N/A (CUT) |
| `payout_pool` | CUT | epoch debris (empty stub, 0 bytes) | N/A (CUT) | N/A (CUT) |
| `requirements.txt` | KEEP | Python deps | none | none |
| `roadmap.md` | REVIEW-KETEVAN | Multi-epoch scope: external BTC/ETH/TON ingestion + "team of ~10" | team of@21, BTC/ETH/TON@108, BTC/ETH@119, ETH@17, ETH@145 | Strip L108 bridge_registry.py multi-chain BTC/ETH/TON, L119 "BTC full node, ETH RPC" multi… |
| `settle_payments` | CUT | epoch debris (empty stub, 0 bytes) | N/A (CUT) | N/A (CUT) |
| `threat_model_global.md` | REVIEW-KETEVAN | Names LacMusa + ALB explicitly; liquidity/buyback scope; BTC/ETH | liquidity/buyback@18, ALB@29, LacMusa@29, liquidity@43, BTC/ETH@103 | Strip L29 "ALB, Lac Musa" exclusion note, L18 "liquidity, buybacks" scope, L43 "Liquidity … |
| `tsconfig.build.json` | KEEP | TS build config | none | none |
| `tsconfig.json` | KEEP | TS config | none | none |
