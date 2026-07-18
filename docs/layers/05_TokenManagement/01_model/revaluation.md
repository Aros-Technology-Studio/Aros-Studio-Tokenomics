# Revaluation (ΔValue)

Canon:

```
new_supply = current_supply × (newValue / previousValue)   // integer arx
```

Delta supply distributed **pro-rata** to current holders (last holder residual).

Direction:

- new > previous → mint allocations  
- new < previous → burn allocations  
- equal → no-op  

Journal: `revaluation_fact` with allocations list.
