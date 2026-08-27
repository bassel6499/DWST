# Canonical Resource Accounting

This document freezes the meaning of resource fields before legacy modules are migrated.

## Personnel
Personnel status is mutually exclusive. `total` equals the sum of available, assigned, training, wounded, missing and killed. Killed personnel remain killed; they are never returned by a readiness or replacement calculation.

## Specialist personnel
A specialist pool represents personnel assigned to a specialty. `qualified` is a subset of that pool and `training` is the subset currently undergoing qualification. Experience classes (trained/experienced/veteran) are subsets of qualified personnel, never additional personnel.

## Equipment
Equipment state is mutually exclusive: total = operational + damaged + destroyed. Assigned equipment is a subset of operational equipment. Destroyed equipment cannot reappear without an explicit replacement/reconstitution event.

## Crew coupling
Each equipment type may declare a crew specialty and personnel-per-system requirement. Usable systems are the minimum of operational systems and the number supportable by qualified personnel. This is an availability constraint, not a combat-loss formula.

## Training
Training is a state transition over elapsed simulation time. A training order creates/advances a training cohort; it does not instantly create a ready specialist. Experience quality cannot be manufactured by training a unit for one turn.

## Separation from combat
These ledgers account for resources. Combat equations determine losses/effects and return proposed events. They must not directly mutate these ledgers. A single commit stage applies validated events.

## Legacy compatibility
The existing `crews.ts` and `equipment.ts` implementations remain untouched during this phase. Adapters/migration will be introduced only after the semantics are tested and mapped explicitly.
