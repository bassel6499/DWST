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

## Current blockers before merge
- Reconcile aggregate UnitState equipment/personnel fields with detailed ledgers.
- Replace duplicate crew training/reinforcement implementations with one pipeline.
- Remove direct state mutation from combat resolution.
- Define canonical deterministic RNG/state handling.
- Add accounting and replay regression tests.
- Validate the mathematical combat models independently before connecting them to UI/scenarios.

## Merge policy
Do not merge this branch into the working branch until every blocker has an explicit implementation and passing test evidence.
