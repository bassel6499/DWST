# DWST Master Refactor Plan

> Authoritative roadmap and current refactor state for `audit/canonical-state-refactor`.
>
> This document is documentation only. It is not imported, executed, or required by DWST runtime/project code.

## Plan authority and synchronization rules

1. This file is the single authoritative current roadmap/state document under `docs/dwst/`.
2. The roadmap must preserve the original roadmap phases, milestones, rationale, and completed history. New findings are appended to the appropriate phase; they do not replace older records.
3. Never create a competing plan, ledger, sidecar roadmap, or alternate current-state file.
4. Before making claims about repository state, inspect the current branch and relevant source files directly. Search/index results are discovery aids only and are never proof of absence or current state.
5. Before a plan update, retrieve the current file/blob and use its exact current SHA for the write. Never reconstruct a truncated plan from memory.
6. After every implementation, CI result, audit finding, or architectural decision, update this document before advancing to unrelated work.
7. Record CI as `running`, `red`, `green`, or `user-confirmed green`; never infer green from a commit or from a later run.
8. If a plan write cannot be safely completed, stop advancement rather than create another authority or silently proceed.
9. Plan documents are documentation only and must not be imported by, bundled into, or otherwise directly affect project runtime code.
10. A new chat must be able to recover project state from this file plus the repository itself; conversational memory is not a required source of truth.

## Original roadmap preservation

The original refactor roadmap remains the implementation backbone. Historical phase intent and completed work must remain represented when current-state restructuring is performed. Architectural discoveries found through the Audit Map are recorded against the appropriate master-plan phase before implementation.

## Architectural boundary rules

- WW2 is a selectable scenario/ruleset, never a generic core mechanic.
- ORBAT Mapper is the external map-display/projection system; DWST supplies canonical simulation state and geographic positions.
- The application `scenariostore` geographic model is separate from DWST scenario data. Do not introduce an implicit dependency merely to resolve DWST objectives.
- The Architectural Blueprint/Audit Map is a discovery/debugging map, not an implementation roadmap.
- CI is a validation gate, not architectural proof.
- Canonical simulation state owns authoritative records; projections/read models must not silently become authorities.

## Phase 2 — Canonical State / Architecture Refactor

### P2-S18 — Detection geographic-distance refactor
**Status: CLOSED / CI GREEN**

Detection uses the canonical geographic-distance path rather than a duplicate distance implementation.

### P2-S20 — WW2-specific core leakage audit
**Status: CLOSED / CI GREEN**

Unused WW2-specific core engagement/combat-arms implementations were removed. The surviving WW2 compatibility surface was audited rather than treating WW2 as generic core behavior.

### P2-S21 — legacy geographic-distance audit
**Status: CLOSED**

The canonical spatial path is `geographicDistanceMeters()` / geographic movement. Legacy duplicate distance paths were removed or retired where verified.

### P2-S23 — scenario geographic objectives / locations
**Status: CLOSED / CI GREEN (user-confirmed)**

Implemented a generic DWST scenario-location contract and resolver. Named scenario objectives resolve to canonical `WorldPosition` values and feed `Order.destination` without coupling DWST to the application `scenariostore` or ORBAT Mapper.

Implementation included the Ardennes Bastogne location, live order-path integration, preservation through simulation-session cloning, and focused/end-to-end tests.

Validation history:
- CI `33255461370`: RED — initial integration test had a TypeScript optional-location error.
- Corrective test commit: `77c37f93592d23a35c629e9aac61362a76b68c30`.
- CI `33255660136`: RED — integration assertion incorrectly assumed latitude must increase.
- Corrective commit: `a4df75f97256a17d057de84670660638e5ec9f7b`; assertion changed to the canonical decreasing-distance invariant.
- Subsequent CIs: USER-CONFIRMED GREEN.

### P2-S33 — Ardennes scenario authority / duplicate scenario definitions
**Status: CLOSED / CI GREEN (user-confirmed)**

Audited the scenario architecture and established that DWST's Ardennes scenario is separate from the application's general `scenariostore`/map system. Duplicate Ardennes scenario definitions were removed after direct source inspection; the populated `src/dwst/scenarios/ardennes1944.ts` remains the surviving scenario fixture.

Deletion commits:
- `b58eb2bc9f0d79df440a4d3299b2de7d8d1404b4`
- `5453ec4ae2632fccd9bf16377ee0e50d483ace6c`

Both deletion CIs were user-confirmed green.

Permanent constraint: do not merge the application scenario-store geography into DWST merely to provide objective resolution.

### P2-S27 — canonical personnel/equipment commit bridge
**Status: NEXT / AUDITED, NOT IMPLEMENTED**

Current evidence establishes that canonical personnel/equipment records exist separately from the mutable unit aggregate. `canonicalProjection` treats those records as authoritative and the unit aggregate as a projection. Combat resolution currently mutates `UnitState.personnel` / `UnitState.equipment`, but no verified canonical commit bridge exists in the combat application path.

Next implementation goal: add the smallest generic commit bridge that applies authoritative combat deltas to canonical personnel/equipment state and then derives/refreshes the unit projection, while preserving purity of combat resolution and avoiding WW2-specific coupling.

No implementation should begin until the exact current combat-application path and canonical-state mutation contract are directly re-verified.

## Current execution position

S23 and S33 are complete. The next implementation item is P2-S27. The plan must be synchronized with every implementation and CI result before advancing to the following item.

## Historical / audit record

The Architectural Blueprint/Audit Map remains a discovery artifact. Findings discovered through that audit are incorporated into the phase/item above before implementation. Earlier roadmap information is retained rather than discarded when the current plan is restructured.
