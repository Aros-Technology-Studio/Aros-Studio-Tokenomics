# MODEL — `release-daemon`

Poll loop (UTC): read metrics → evaluate  
`ReleasePhase = (reserveIndex > release.threshold) ∧ (velocity > release.target)`  
→ signal initiation to `release` + governance path.  
Config keys only for numeric thresholds (v1).
