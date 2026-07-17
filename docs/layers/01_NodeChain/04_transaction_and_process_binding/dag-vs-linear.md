# DAG vs linear

## v1 default

- **Main chain:** linear append-only sequence by `height`.  
- **Within processId:** stages may form a logical DAG (parallel document checks, etc.) but each event still lands as a linear append with process binding.

## Why linear main chain

- Simple audit walk  
- Clear tip  
- Enough when PoT+quorum handles confirmation (BFT mesh later)

## Future

If parallel shard privacy is introduced, it must still **commit results** onto this linear SoT (or a formally versioned successor model).  
Sharding must not replace the journal as truth.
