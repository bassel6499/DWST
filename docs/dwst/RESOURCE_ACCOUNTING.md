# Canonical Resource Accounting

This document describes the current canonical resource model and commit boundary.

## Authority
`CanonicalState` is authoritative for detailed personnel, equipment, crew assignments, equipment definitions, ammunition, and fuel. `ScenarioState` resource aggregates are projections used by the simulation engine and are reconciled from canonical records at the session boundary.

## Personnel
Personnel records have mutually exclusive statuses. Unit personnel totals are projections over those records. Killed/missing/wounded personnel remain in their canonical statuses until an explicit, auditable transition changes them.

## Specialist personnel and crew
Specialist qualification is represented by canonical personnel records and explicit crew assignments. Qualification and crew availability are constraints; they do not create additional manpower. Missing or invalid crew-definition data is a validation error, not an inferred replacement.

## Equipment
Equipment instances are canonical records with operational, damaged, or destroyed status. Unit equipment totals are projections over those records. Destroyed equipment cannot reappear without an explicit replacement/reconstitution transition.

## Consumables
Ammunition and fuel are canonical consumable records keyed by unit. Resolution produces explicit typed deltas when consumables are consumed; the canonical session commits those deltas and then reprojects unit aggregates. Detailed sustainment/recovery semantics remain a downstream logistics concern and must not create a second resource authority.

## Combat and resolution separation
Combat and movement resolution produce explicit effects/resource deltas. They do not directly mutate canonical resource records. The canonical session is the authoritative application boundary: resolve → explicit delta → canonical commit → projection.

## Reconciliation invariant
After each canonical turn, projected personnel, equipment, ammunition, and fuel values must reconcile exactly with the corresponding canonical records. Resource changes must never be reconstructed by subtracting projected before/after `UnitState` aggregates.

## Legacy compatibility
Retired aggregate ledgers, equipment pools, and crew pools are not operational authorities. Compatibility adapters may expose legacy shapes where required, but they must not maintain competing mutable resource state.
