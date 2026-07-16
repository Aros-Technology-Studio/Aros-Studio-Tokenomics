# DIAGRAM — `portal`

## Edge architecture

```mermaid
flowchart TB
  UI[Next.js frontend] --> BE[Nest edge backend]
  BE -->|KEP check| Docs[document upload]
  BE -->|economic| Core[/v1/core Orchestrator]
  BE -.->|must not| Val[invent valuation]
```

## User flow tokenize

```mermaid
sequenceDiagram
  participant I as Institution
  participant F as Portal FE
  participant B as Portal BE
  participant C as Core Orchestrator
  I->>F: package + KEP
  F->>B: upload
  B->>B: verify signature
  B->>C: StartProcess
  C-->>B: process status
  B-->>F: status UI
```

## Boundary

```mermaid
flowchart LR
  Portal -->|edge only| Core
  Core --> PoT
  Core --> NodeChain
```
