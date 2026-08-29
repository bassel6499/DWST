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
4. Replace the master plan atomically using its current blob SHA through the GitHub Contents `update_file` operation. The write operation must be explicitly discovered under the GitHub `contents` tool surface before use; do not assume it is loaded.
5. Re-read the resulting file/blob and verify roadmap, historical records, findings, statuses, CI identifiers, and rules.
6. Record the resulting master-plan commit/blob SHA in this ledger.
7. Keep this ledger compact; never copy the whole master plan here.
8. If the complete master plan cannot be obtained, do not write it; resolve retrieval/tool-discovery first.
9. After every implementation/validation result, synchronize the master plan before beginning another implementation item. If a connector/tooling failure temporarily prevents that write, record the exact pending delta here and do not advance to unrelated implementation work until the authoritative plan has been synchronized.

## Current synchronization checkpoint

- Branch: `audit/canonical-state-refactor`
- Current code commit after S23 test correction: `77c37f93592d23a35c629e9aac61362a76b68c30`
- Master-plan complete-source blob currently being synchronized: `022643bca62ea4aad21b8a8dbb3a7bb3a9fb87ac`
- Last known master-plan update commit: `18be637fdfb5b797748843ed4689a5d3fc54b68a`
- **Pending master-plan synchronization:** record S33 closure; record S23 implementation and integration-test result; record CI run `33255461370` red on the first integration-test commit and its exact TypeScript failure; record corrective test commit `77c37f93592d23a35c629e9aac61362a76b68c30`; preserve all historical roadmap/rules/findings.

## Current verified work state

- P2-S24: closed; final CI user-confirmed green (`33206531980`).
- P2-S25: closed by P2-S37; CI user-confirmed green (`33205394873`).
- P2-S37: closed; CI user-confirmed green (`33205394873`).
- Duplicate Ardennes scenario files: removed; both deletion CIs user-confirmed green.
- P2-S33: architectural discovery and duplicate-file cleanup are complete; closure is pending authoritative master-plan synchronization.
- P2-S23: implementation is complete, but validation is not yet green. The first live integration-test commit `6f4ae00f08904940f78c8d04474e9fca97caa1c3` failed CI run `33255461370` at type-check because `ardennes1944.locations` was possibly undefined. The test was corrected in `77c37f93592d23a35c629e9aac61362a76b68c30`; awaiting CI for that corrected commit.

## 2026-08-29 checkpoint

The current audit established that the application's `scenariostore` geographic subsystem and DWST's simulation scenario fixture are separate systems with no verified integration path. Do not couple them merely to resolve DWST objectives.

The surviving Ardennes fixture is `src/dwst/scenarios/ardennes1944.ts`. DWST movement consumes `Order.destination: WorldPosition`; the natural-language parser produces an objective string and the DWST scenario-location resolver now resolves verified named scenario locations into canonical destinations. This location layer remains generic DWST scenario data and is independent of the parser, application scenario store, and map renderer.

P2-S33 established that the former competing Ardennes files were obsolete/duplicate scenario definitions; the populated `src/dwst/scenarios/ardennes1944.ts` remains the surviving scenario fixture. Both deletion CIs were user-confirmed green.

P2-S23 added the smallest generic scenario-location contract/resolver and integrated it into the live order-to-simulation path. The canonical movement engine was not replaced or duplicated. The live integration test initially exposed a strict TypeScript optional-location access defect; that test-only defect was corrected in commit `77c37f93592d23a35c629e9aac61362a76b68c30` and requires CI validation before S23 closure.

## Permanent synchronization rule

The master plan remains authoritative. This ledger is only the compact operational checkpoint. The durable fix for the prior synchronization/tooling failures is now explicit: always discover the GitHub `contents` tool surface before plan writes, retrieve the complete master-plan blob by exact SHA, update it with the exact current blob SHA, then re-read and verify the resulting file before advancing. No partial-read reconstruction is permitted. If the write tool is unavailable, the exact delta is recorded here and unrelated implementation is blocked until the master plan is synchronized.
