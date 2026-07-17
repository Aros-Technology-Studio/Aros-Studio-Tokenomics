# 03_Processing

**Status:** v1 draft + code `src/processing`  
**Issue:** LAYER 03 processing  
**Role:** Process lifecycle stages; write `process_*` records to NodeChain before PoT.

## Stages (v1 primary tokenization)
opened → documents → encoded → awaiting_pot → pot_done → settled/closed

## Code
`ProcessService.open | markPotDone | close`
