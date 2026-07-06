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
