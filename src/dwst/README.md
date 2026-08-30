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

`consumer -> public DWST API -> canonical Core session -> state/report outputs`

The engine is intentionally separated from presentation so the same simulation can run in a desktop browser, Android browser/PWA, or a future native wrapper.

## Public API boundary

Consumers of DWST must import simulation contracts and entry points from `src/dwst/index.ts` (the `@/dwst` alias in the application), rather than importing individual files from `src/dwst/core`.

The public boundary exposes the canonical session entry points, stable state/rules/provenance contracts, order parsing, scenario-objective resolution, and map projection needed by consumers. It does not expose the internal turn-state mutation pipeline as a consumer-facing authority.

Scenario definitions remain under `src/dwst/scenarios`; UI components remain under `src/dwst/ui`. Neither layer is a simulation authority.
