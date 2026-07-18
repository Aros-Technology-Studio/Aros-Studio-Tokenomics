# Test plan — 01_NodeChain

## Unit

- schema validation accept/reject  
- contentHash computation stable  
- prevHash linking  
- idempotent append  
- authz matrix deny-by-default  

## Integration

- crash mid-write: no torn height  
- replica catch-up verifies chain  
- mirror rebuild from journal  
- read-only mode blocks append  

## Property / replay

- random append sequences: replay tip hash stable  
- snapshot + tail == full replay  

## Negative

- tampered historical payload fails verify  
- institution cannot read foreign processId  
- unknown recordType rejected  

## Not in this suite

- PoT P1–P4 correctness  
- mint math  
- All-Seeing Eye agent behaviour  
