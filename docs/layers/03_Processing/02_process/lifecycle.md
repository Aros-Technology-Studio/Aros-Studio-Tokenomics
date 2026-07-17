# Lifecycle
1. open → process_open + process_stage(encoded)  
2. pot layer runs  
3. markPotDone → process_stage(pot_done)  
4. close → process_close  
Fail-closed: unknown processId throws.
