# DIAGRAM — `pot-engine`

## Module boundary

```mermaid
flowchart TB
  subgraph pot_engine
    Evidence[evidence model]
    Criteria[P1-P4]
    Quorum[M-of-N]
    Verdict[verified 0|1]
  end
  Evidence --> Criteria --> Quorum --> Verdict
  Verdict --> NC[src/nodechain]
  Verdict --> Em[src/emission ok signal]
  Orch[src/orchestrator] --> pot_engine
```

## Criteria all-pass

```mermaid
flowchart LR
  P1 --> P2 --> P3 --> P4 --> OK[criteriaResult all true]
  P1 -.->|any fail| Z[verified 0 + reason]
  P2 -.-> Z
  P3 -.-> Z
  P4 -.-> Z
```

## Quorum

```mermaid
flowchart TB
  N[assigned validators N] --> M[M = ceil 2/3 N default]
  M --> Collect[signatures]
  Collect -->|M reached| Verified
  Collect -->|timeout| Expired
```
