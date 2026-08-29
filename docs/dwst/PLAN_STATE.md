# DWST Plan State Ledger

> This is a compact, append-only operational ledger for the authoritative `docs/dwst/MASTER_REFACTOR_PLAN.md`.
>
> It does **not** replace the master plan, the original roadmap, or historical findings. Its purpose is to make synchronization durable and auditable without repeatedly reconstructing the large master document.

## Authority

- Authoritative work plan: `docs/dwst/MASTER_REFACTOR_PLAN.md`
- This ledger: synchronization/verification aid only.
- Architectural Blueprint: discovery/debugging map only.
- Repository evidence must be read directly from the current branch before implementation or closure.

## Lossless synchronization protocol

1. Read the current branch ref directly.
2. Obtain the complete master-plan blob using its exact SHA; never reconstruct it from search results or partial reads.
3. Preserve the complete document and edit only the required sections.
4. Replace the master plan atomically with its current blob SHA.
5. Re-read the resulting blob and verify roadmap, historical records, findings, statuses, CI evidence, and rules.
6. Record the resulting master-plan commit/blob SHA in this ledger.
7. Keep this ledger compact; never copy the whole master plan here.
8. If the complete master plan cannot be obtained, do not write it.

## Current synchronization checkpoint

- Branch: `audit/canonical-state-refactor`
- Branch head before this checkpoint: `5453ec4ae2632fccd9bf16377ee0e50d483ace6c`
- Master-plan blob used as the complete source: `022643bca62ea4aad21b8a8dbb3a7bb3a9fb87ac`
- Last known master-plan update commit: `18be637fdfb5b797748843ed4689a5d3fc54b68a`

## Current verified work state

- P2-S24: closed; final CI user-confirmed green (`33206531980`).
- P2-S25: closed by P2-S37; CI user-confirmed green (`33205394873`).
- P2-S37: closed; CI user-confirmed green (`33205394873`).
- Duplicate Ardennes scenario files: removed; both deletion CIs user-confirmed green.
- P2-S33: architectural discovery is complete; the former competing-file finding must be closed after the master-plan synchronization described in this checkpoint.
- P2-S23: active. The generic DWST scenario-location/objective contract is the next implementation boundary. It must remain independent of `scenariostore` and ORBAT Mapper.

## 2026-08-29 checkpoint

The current audit established that the application's `scenariostore` geographic subsystem and DWST's simulation scenario fixture are separate systems with no verified integration path. Do not couple them merely to resolve DWST objectives.

The surviving Ardennes fixture is `src/dwst/scenarios/ardennes1944.ts`. DWST movement consumes `Order.destination: WorldPosition`; the natural-language parser currently produces an objective string and does not resolve it. The future location layer therefore belongs to generic DWST scenario data, not the parser, application scenario store, or map renderer.

The next implementation is to add the smallest generic scenario-location contract and resolver, then integrate objective resolution at the order-issuance boundary once its current consumers are directly verified.
