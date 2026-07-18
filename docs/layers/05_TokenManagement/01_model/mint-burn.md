# Mint / burn

## Mint

```
require potVerified === 1
require potLedgerHeight >= 0
forbid if mint_fact already exists for processId
credit holder
append mint_fact
```

## Burn

```
require balance >= amount
debit holder
append burn_fact
```

Amounts: decimal strings, 9 places (arx integer internally).
