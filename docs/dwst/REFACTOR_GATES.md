# DWST Refactor Safety Gates

This branch is an audit/refactor branch. It is not a production merge.

## Non-negotiable invariants
- One authoritative simulation state.
- Scenario data never changes core model code.
- Personnel, crews, and equipment remain separately accountable.
- Required crew availability caps usable equipment.
- No implicit personnel/equipment replacement.
- Training is time-consuming and cannot fabricate veteran experience.
- Combat resolution must not mutate authoritative state directly.
- Equipment losses must have exactly one accounting path per resolution.
- Identical state + orders + ruleset + seed must produce identical results.
- Historical provenance and model assumptions must remain distinguishable.

## Current architecture / verification status
The original blocker list below is retained as historical refactor context, not as a statement of current open blockers. The Master Refactor Plan is authoritative for finding status.

The current canonical architecture establishes:
- canonical `ScenarioState`/session ownership for live simulation execution;
- `CanonicalState` as the authoritative detailed resource record layer;
- explicit resource deltas applied at the canonical session commit boundary;
- a single era-ruleset boundary with readonly/deep-frozen configuration;
- deterministic replay provenance and ordered command journaling;
- a supported public Core/API boundary through `src/dwst/index.ts`;
- explicit validation of era capability, equipment definitions, and crew requirements;
- `WorldPosition` as the operational physical-position representation, with map/screen conversion outside Core.

Previously identified blockers have been addressed through the S-series architecture work and B-series verification gates. Any future discrepancy must be recorded as a new finding rather than inferred from this historical list.

## Historical pre-refactor blockers
The following items describe the conditions that originally motivated the refactor:
- Reconcile aggregate UnitState equipment/personnel fields with detailed ledgers.
- Replace duplicate crew training/reinforcement implementations with one pipeline.
- Remove direct state mutation from combat resolution.
- Define canonical deterministic RNG/state handling.
- Add accounting and replay regression tests.
- Validate the mathematical combat models independently before connecting them to UI/scenarios.

## Merge policy
Do not merge this branch into the working branch until every blocker has an explicit implementation and passing test evidence. The audit/refactor branch must remain separate from production/main integration until the applicable completion gate is satisfied.

## Status discipline
This file is a safety/context document. It does not override the Master Refactor Plan. A historical blocker must not be treated as an active blocker unless current repository evidence demonstrates that it has reappeared or remains unresolved.
