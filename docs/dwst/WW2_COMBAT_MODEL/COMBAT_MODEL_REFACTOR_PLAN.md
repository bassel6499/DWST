# WW2 Combat Model — Mini Refactor Plan

> **Purpose:** A compact, combat-model-specific memory and implementation plan for the WW2 combat overhaul. This document is subordinate to `docs/dwst/MASTER_REFACTOR_PLAN.md`; it does not replace or duplicate the Master Plan. The Master Plan remains authoritative for project-wide architecture, status, and rules.
>
> **Scope:** WW2 combat model, its canonical capability inputs, detection/engagement information, tactical consequences, accounting boundary, calibration, and validation.
>
> **Change-control:** No implementation change is implied by this document. Each item requires explicit authorization before code changes.

## 1. Non-negotiable rules

1. Inspect the current repository, tests, and callers before every implementation step.
2. Never guess about existing architecture, data, identifiers, historical facts, or behavior.
3. Never modify code or repository files without explicit authorization.
4. Keep Core generic; WW2-specific rules stay in the WW2 era package.
5. Canonical individual records remain the authority. Aggregate `UnitState` values are combat projections, not competing authorities.
6. Preserve deterministic behavior for identical inputs, rules, and explicit RNG state.
7. Pure combat resolution must not mutate supplied input.
8. Resource and casualty accounting must reconcile from explicit deltas to canonical records.
9. Do not invent coordinate conversions or silently change spatial semantics.
10. Do not individualize the entire combat simulation merely because individual records exist.
11. Do not introduce random detection or random friction where the current deterministic architecture does not require it.
12. Do not reopen completed S-series architecture findings without new direct evidence.
13. Deferred findings must be recorded here or in the Master Plan rather than silently dropped.
14. No weapon-specific, personnel-specific, or historical coefficient detail should be invented merely to make the model look more realistic.
15. Historical calibration must use real observations/data; never fabricate benchmark values.

## 2. The key architectural fact

The individual record system is **already connected to combat**. The task is not to "connect records to combat" from scratch.

Current authoritative flow:

```text
CanonicalState
    |
    +--> canonical personnel/equipment/resources
    |
    v
Canonical projection
    |
    +--------------------+
    |                    |
    v                    v
Detection capability   Combat capability
    |                    |
    v                    v
Core detection        WW2 combat model
    |                    |
    v                    |
contacts/confidence   aggregate effects
    |                    |
    +--------+-----------+
             v
      engagement context
             |
             v
       WW2 combat resolution
             |
             v
 aggregate personnel/equipment/resource/condition effects
             |
             v
      canonical allocation
             |
             v
 explicit personnel IDs / equipment instance IDs
             |
             v
       new CanonicalState
             |
             v
     next-turn projection
```

### What the individual model currently does

- Authoritative physical/resource state.
- Personnel ownership/status.
- Equipment instance ownership/status.
- Crew-to-equipment assignment.
- Equipment/crew readiness.
- Source for aggregate combat capability.
- Deterministic casualty/equipment-loss allocation.

### What it does **not** currently do

- Individual soldiers/tanks fighting as separate tactical entities.
- Individual personnel experience directly modifying combat equations.
- Weapon-by-weapon firing resolution.
- Per-vehicle target selection.
- Individual sensor records as a mandatory requirement.

Those omissions are intentional unless later evidence and authorization justify changing the abstraction level.

## 3. Canonical record model — verified structure

### Personnel

`PersonnelRecord` contains:

- `id`
- `unitId`
- `status`
- `qualifications`
- `experience`

Ownership is explicit. `unitId` is required; `null` explicitly represents non-unit/unassigned personnel.

### Equipment

`EquipmentInstance` contains:

- `instanceId`
- `definitionId`
- `unitId`
- optional `serial`
- `status` (`operational`, `damaged`, `destroyed`, `missing`)

### Crew

`InstanceCrewAssignment` explicitly binds personnel to an equipment instance through:

- `instanceId`
- `slot`
- `personnelId`
- `specialty`

Validation prevents invalid/duplicate crew assignments and checks qualification/specialty compatibility.

### Equipment definitions

`EquipmentDefinition` currently provides:

- `id`
- `name`
- `era`
- `equipmentType`
- `crewRequirementId`

WW2 crew requirements currently include data-defined requirements for tanks, AT guns, and artillery. These definitions are data contracts; changing them must not silently alter the combat equations outside the capability projection.

## 4. The capability principle to preserve

Combat capability should be understood as:

```text
possessed
  -> operational
  -> crew-ready
  -> tactically available
  -> target-relevant
  -> effective in current geometry/environment
```

A record existing in the OOB does not automatically mean it contributes full combat power.

The same principle should be applied to detection:

```text
possessed sensor capability
  -> operational
  -> available
  -> environment-appropriate
  -> effective detection capability
  -> contact
  -> confidence
```

This is the preferred bridge between canonical records and the aggregate WW2 model.

## 5. Detection — verified current architecture

Detection is already a **Core-owned mechanism** with an **era-owned detection policy**. It must remain that way.

`src/dwst/core/detection.ts` currently:

- filters destroyed units;
- evaluates opposing unit pairs;
- computes geodesic distance;
- uses sensors associated with `unitId` when present;
- otherwise uses the era policy's unaided range;
- modifies effective range using observer intelligence/readiness and weather;
- produces deterministic detection probability/threshold behavior;
- returns contact confidence of `unknown`, `unit`, or `formation`.

### Important detection findings

1. Do **not** plan to "integrate detection with combat" as though it is disconnected. It already feeds the combat engagement chain.
2. `Sensor` is currently a `ScenarioState.sensors` capability, not a verified `EquipmentInstance` relationship.
3. Do not automatically convert every sensor into an equipment instance.
4. Detection is deterministic. `probability` is currently a thresholding score (`detected` when the score reaches 1), not a random roll.
5. Contact `confidence` exists but is underused by combat orchestration.
6. Surprise currently relies mainly on intelligence difference rather than fully exploiting detection/contact information.
7. Persistent contact state is not established in the live orchestration; do not assume it exists.
8. Existing detection tests cover geodesic distance, antimeridian behavior, side filtering, and era policy effects.

### Desired direction

Improve the information path without moving detection into WW2:

```text
canonical physical state
    -> detection capability projection
    -> Core detection
    -> contact + confidence
    -> engagement context
    -> WW2 interpretation of surprise/reaction/phase
```

## 6. Current WW2 combat model — baseline after Wave 3 decomposition

The WW2 combat model has already been decomposed into:

```text
force quality
    -> capability
    -> support
    -> geometry
    -> target interaction
    -> effectiveness
    -> RK4 attrition
    -> combat effects
    -> tactical outcome
```

Current decomposition modules include:

- `combatCoefficients.ts`
- `combatCapability.ts`
- `combatGeometry.ts`
- `combatTargetInteraction.ts`
- `combatAttrition.ts`
- `combatEffects.ts`
- `combatOutcome.ts`
- `combatResolution.ts`
- `combatTypes.ts`
- `combat.ts` orchestrator

The public `resolveWW2Combat()` interface is preserved.

### Current model capabilities

- force composition by broad combat categories;
- armor / anti-armor interaction;
- artillery and air support;
- ammunition as firing capacity;
- fuel affecting mobility;
- readiness, fatigue, wear, morale, suppression, and disorganization;
- range and geometry effects;
- terrain/LOS/exposure effects;
- frontage and force density;
- phases;
- reserve fraction and reserve response;
- command/reaction effects;
- explicit resource/condition deltas;
- equipment-relative losses;
- deterministic RK4 resolution;
- tactical movement consequences;
- deterministic validation and maintainability gates.

### Known mathematical/quality limitations

The architecture is substantially stronger than the combat mathematics. Current model quality was previously assessed approximately as:

- architecture: strong;
- Core/era separation: strong;
- determinism/numerical stability: strong but still improvable;
- resource/accounting: strong;
- force composition: moderate;
- target dependence: moderate;
- range/geometry: moderate;
- force density: moderate;
- suppression/disorganization: moderate;
- phases: moderate;
- tactical outcomes: moderate;
- reserves/counterattack/exploitation: weakest major area;
- historical calibration: weakest area.

Do not respond to these limitations by adding arbitrary modifiers. Improvements must have a causal reason, explicit ownership, tests, and preferably observable/calibratable behavior.

## 7. Combat-model improvement sequence

Implement in dependency order, revalidating the repository before each stage.

### W3-01 — Coefficients/model governance

- Keep WW2 coefficients centralized.
- Give every coefficient a documented role and owner.
- Avoid duplicated constants.
- Do not invent historical values without evidence.

### W3-02 — Capability representation

Build the strongest honest aggregate capability projection available from canonical records:

```text
possessed -> operational -> crew-ready -> available
```

Preserve category-level abstraction unless scenario data supports finer detail.

### W3-03 — Target interaction

Make effectiveness depend on what is actually being attacked:

- armor vs armor;
- anti-armor vs armor;
- artillery against different target classes;
- infantry/direct fire interactions;
- support effects.

Keep this category-level unless verified weapon-level definitions are introduced later.

### W3-04 — Geometry/terrain/exposure

Use explicit:

- distance;
- terrain type;
- LOS;
- target exposure;
- frontage;
- density;
- engagement phase.

Never create an implicit map-coordinate conversion.

### W3-05 — Combat phases

Phases must change actual commitment/effectiveness, not merely label an engagement.

Current phase vocabulary includes approach, positioning, preparation, main engagement, assault, with exploitation available as a state concept but not automatically generated by the single-engagement classifier.

### W3-06 — Suppression/disorganization

- Keep suppression distinct from casualties.
- Carry suppression/disorganization into subsequent combat quality.
- Recover them deterministically between turns.

### W3-07 — Tactical state consequences

Apply verified tactical consequences at the canonical combat-state boundary:

- attacker advance;
- defender withdrawal;
- penetration/breakthrough where justified.

Do not mutate combat inputs directly.

### W3-08 — Reserves/counterattack

Use existing reserve concepts:

- committed;
- reserve;
- alert;
- moving;
- counterattacking.

Reserve response should depend on command/reaction and actual tactical outcomes. A full multi-unit exploitation state machine remains deferred until the current OOB/engagement data model can support it honestly.

### W3-09 — Command/reaction/friction

Command should affect:

- coordination;
- maneuver;
- reserve reaction;
- deterministic reaction delay.

Do not add random friction simply to simulate uncertainty.

### W3-10 — Sustainment

- Ammunition is firing capacity.
- Zero relevant ammunition must eliminate that ammunition contribution.
- Consumption must be represented by explicit bounded deltas.
- Fuel affects mobility.
- Fuel changes must be explicit.
- Keep all resource accounting on the canonical resource pipeline.

Detailed weapon-specific ammunition/fuel lifecycle remains out of scope until supported by authoritative scenario data.

### W3-11 — Historical calibration

Support comparison of simulation outputs against real observations for:

- attacker personnel loss rate;
- defender personnel loss rate;
- equipment loss rates;
- advance/movement;
- duration only when actual duration data exists.

**Never use placeholder historical durations or fabricated observations.**

### W3-12 — Validation 2.0

At minimum maintain deterministic regression coverage for:

- identical inputs -> identical outputs;
- improved quality -> sensible directional behavior;
- range effects;
- condition effects;
- zero ammunition;
- fuel/mobility;
- suppression/disorganization;
- terrain/LOS/exposure;
- phase behavior;
- tactical movement;
- reserve response;
- canonical accounting;
- individual loss allocation.

### W3-13 — Maintainability gate

Keep the combat model decomposed and auditable:

- small stage modules;
- centralized coefficients;
- no `as any` in WW2 combat stages;
- file/function complexity under project limits;
- maintainability check in CI;
- public combat API unchanged unless explicitly authorized.

## 8. Loss/accounting boundary — do not break this

Combat resolution produces **aggregate effects**. Canonical state remains responsible for committing those effects to actual records.

```text
aggregate combat loss count
    -> canonical allocation policy
    -> stable eligible personnel/equipment records
    -> explicit IDs/dispositions
    -> canonical commit
```

`canonicalCombatAllocation.ts` is an allocator, not a casualty model.

`canonicalCombatCommit.ts` is the canonical mutation boundary.

Do not move historical casualty-selection assumptions into generic Core allocation unless the architecture explicitly requires it.

## 9. What must NOT be done automatically

These are explicit anti-scope rules for this combat overhaul:

- Do not rebuild the canonical personnel/equipment system.
- Do not create a second resource engine.
- Do not create a second combat authority.
- Do not move WW2 rules into Core.
- Do not move detection into WW2.
- Do not make every sensor an equipment instance without evidence.
- Do not make every individual record a tactical combat actor.
- Do not add random detection.
- Do not add random combat modifiers without a defined deterministic RNG/seed contract.
- Do not immediately add weapon-level modeling.
- Do not immediately make individual personnel experience a combat coefficient.
- Do not immediately split ammunition by weapon.
- Do not add historical coefficients because they "look realistic".
- Do not reopen completed architecture findings merely because the same modules are touched.
- Do not fabricate calibration datasets.

## 10. Deferred work register

These are deliberately deferred, not forgotten:

| Item | Reason for deferral |
|---|---|
| Full multi-unit exploitation state machine | Current OOB/engagement model does not provide enough verified structure to implement honestly. |
| Weapon-specific combat | Current equipment catalog is category-level; weapon-level behavior would require new authoritative scenario data. |
| Individual personnel combat effects | Individual records exist for authority/accounting/readiness, not as individual tactical actors. |
| Weapon-specific ammunition pools | Current canonical resource model does not establish that granularity. |
| Sensor-as-equipment-instance mapping | `Sensor` is currently unit-level scenario capability; relationship to equipment instances is not verified. |
| Persistent contact memory | Current live detection orchestration does not establish persistent contact state. |
| Full use of detection confidence | Existing confidence is available but currently underused; improve only after verifying engagement semantics. |
| Historical calibration coefficients | Require real observations/authoritative data first. |

## 11. Required audit before the next implementation batch

Before changing the model again, inspect directly:

- canonical personnel fixtures;
- canonical equipment fixtures;
- WW2 equipment definitions;
- crew requirements and crew assignments;
- equipment readiness tests;
- canonical projection tests;
- canonical combat allocation/commit tests;
- sensor fixtures;
- `detection.ts` and `detection.test.ts`;
- Core combat orchestration and engagement tests;
- WW2 combat tests and validation tests;
- actual WW2 scenario construction/OOB data;
- calibration fixtures/data, if any;
- current branch HEAD and current Master Plan.

The purpose is to determine what information the model **actually has**, not what we wish it had.

## 12. Acceptance gate for this combat overhaul

The combat model is not considered complete merely because the code exists or CI is green.

A stage is complete only when:

1. the intended invariant is implemented;
2. callers/consumers use the intended path;
3. tests demonstrate the behavior;
4. accounting still reconciles;
5. deterministic behavior is preserved;
6. no parallel authority was introduced;
7. deferred limitations are recorded;
8. the Master Plan and this mini-plan agree on status;
9. historical claims/coefficients are evidence-backed where applicable;
10. the current branch is re-inspected after implementation.

## 13. Current architectural north star

> **Do not make the simulation individual merely because the state is individual. Make the aggregate combat model consume the best authoritative information the individual state can provide, then commit the resulting aggregate effects back to the actual individual records.**

The intended end state is therefore:

```text
individual canonical truth
        |
        +--> detection capability
        |        |
        |        +--> contact/confidence
        |
        +--> combat capability
                 |
                 +--> target/geometry/context
                          |
                          v
                    WW2 combat model
                          |
                          v
                   aggregate effects
                          |
                          v
                 individual canonical commit
```

This is the governing mental model for future WW2 combat work.