# Canonical JSON

- Object keys sorted A–Z at every depth  
- Arrays keep order; elements canonicalized  
- Strings/bool/null only for business data; amounts as strings  
- Non-integer JSON numbers → error  
- BigInt → error  

Ensures bit-identical `encoded` across runtimes for the same logical input.
