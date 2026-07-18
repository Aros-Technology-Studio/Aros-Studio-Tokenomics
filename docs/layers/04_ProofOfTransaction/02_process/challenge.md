# Pre-verdict challenge

Open challenges block `verified=1`.

Journal:

- `param_change` kind `pot_challenge_open`  
- `param_change` kind `pot_challenge_close`  

Net open count > 0 → reason `CHALLENGE_OPEN`.

After close, verify may pass. Challenges do not rewrite past final verdicts.

API: `PotService.openChallenge` / `closeChallenge`
