# Double confirm

If a journaled `pot_verdict` exists for processId with `verified=1` and `final=true`:

- Do **not** append a second positive verdict.  
- Throw / return error `POT_ALREADY_FINAL`.  
- All-Seeing Eye may observe the attempt (caller notifies).  

This protects double-mint at the gate, in addition to TokenService process mint set.
