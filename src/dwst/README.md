# DWST Core

DWST (Deterministic Wargame Simulation Template) is the simulation layer being added to the ORBAT Mapper fork.

## v0.1 scope

- Operational WWII-first architecture
- Tactical sub-unit tracking
- Deterministic unit state
- Structured and natural-language order targets
- Movement and sustainment baseline
- Permanent unit-state history
- Era-specific combat modules to follow

## Architecture

`ORBAT Mapper UI -> Scenario State -> Command/Order Layer -> DWST Engine -> Updated Scenario State`

The engine is intentionally separated from presentation so the same simulation can run in a desktop browser, Android browser/PWA, or a future native wrapper.
