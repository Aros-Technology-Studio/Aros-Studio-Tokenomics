# PURPOSE — `release-daemon`

**Status:** ready (support module)  
**Code path:** `src/release-daemon/` (or process under `release`)  
**P4.16:** **real in v1**

Monitors `reserveIndex` and `velocity` against `release.threshold` / `release.target` and **initiates** Release Phase transition (with governance as required by release pack). Does not hold Eye powers.
