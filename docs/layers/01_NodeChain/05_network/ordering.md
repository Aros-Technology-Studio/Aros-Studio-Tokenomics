# Ordering

## Rule

Global order of significant facts is the order of **main-chain heights**.

## v1 mechanism

Prefer simplicity:

1. Authenticated append service assigns height under concurrency control; or  
2. Small confirmer set co-signs each append batch; height assigned when Q met.

Leader may **propose** order of pending appends; leadership is not bought with ARO.

## Determinism

Given the same journal, every honest node reconstructs the same sequence of effects.

## Time

`timestampUtc` is metadata; **height** wins conflicts.  
Clocks use **UTC only**.
