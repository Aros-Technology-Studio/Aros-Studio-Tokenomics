# Diagram — hash chain

```mermaid
flowchart LR
  G[Genesis h0] --> R1[Record h1]
  R1 --> R2[Record h2]
  R2 --> R3[Record h3]
  R3 --> T[Tip]
```

Each step: `prevHash` equals prior envelope hash; break ⇒ integrity failure.
