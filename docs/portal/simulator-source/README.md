# Settlement Simulator — source

Source of truth for the portal embed `portal/frontend/public/embed/settlement-simulator.html`.

- `simulator.html` — engine, scenario registry and the main scenario (`fc`). Scenarios `payment` and `fx2` are `hidden:true` until their With-AFC tracks are rewritten.
- `v2/` — frame UI (CSS, markup, app script) and `build.py`.
- `gen_portal.py` — wraps the built page for the portal.

Build the portal embed (run from this folder):

    python3 v2/build.py simulator.html /tmp/v2-portal.html gov/*.js
    python3 gen_portal.py /tmp/v2-portal.html ../../../portal/frontend/public/embed/settlement-simulator.html

The fragments include government, treasury and capital markets cases. Historical deep-link keys are preserved.
