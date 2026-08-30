# Canonical resource accounting

The canonical ledger has one authoritative personnel population. Specialist pools and crew assignments reference that population through stable personnel IDs; they never create additional manpower.

## Current authority
- `CanonicalState.personnel` is authoritative for personnel records and status.
- `CanonicalState.equipment` is authoritative for equipment instances and status.
- `CanonicalState.crewAssignments` is authoritative for explicit equipment/personnel crew bindings.
- `CanonicalState.consumables` is authoritative for ammunition and fuel.
- `ScenarioState` resource aggregates are projections reconciled from canonical records.

## Invariants
- Personnel status buckets reconcile exactly to the canonical personnel population.
- Each personnel ID has one canonical record and explicit ownership semantics are required where it is assigned.
- Equipment status is mutually exclusive and unit aggregates reconcile to canonical instances.
- Assigned equipment cannot exceed operational equipment.
- Qualified crew availability caps usable equipment; crew requirements never manufacture personnel.
- Unknown or invalid legacy crew data is never inferred as a replacement and is surfaced through validation.
- Combat and movement resolution do not directly mutate authoritative resource state.
- Resolution produces explicit typed resource deltas; the canonical session applies those deltas at the commit boundary.
- Ammunition and fuel are committed through canonical consumable deltas; their detailed recovery/sustainment rules remain downstream logistics scope.
- No aggregate before/after `UnitState` subtraction is used to reconstruct canonical resource changes.
