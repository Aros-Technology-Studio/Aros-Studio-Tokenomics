# Settlement Simulator — source

Source of truth for the portal embed `portal/frontend/public/embed/settlement-simulator.html`.

- `simulator.html` — engine, scenario registry and the main scenario (`fc`). Scenarios `payment` and `fx2` are `hidden:true` until their With-AFC tracks are rewritten.
- `v2/` — frame UI (CSS, markup, app script) and `build.py`.
- `gen_portal.py` — wraps the built page for the portal.

Build the portal embed (run from this folder):

    python3 v2/build.py simulator.html ../../../v2-portal.html
    python3 gen_portal.py ../../../v2-portal.html ../../../portal/frontend/public/embed/settlement-simulator.html

Government scenarios (G01–G12) are not in this folder yet; they still use the previous With-AFC model.
