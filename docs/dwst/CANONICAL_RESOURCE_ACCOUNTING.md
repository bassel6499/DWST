# Canonical resource accounting

The canonical ledger has one authoritative personnel population. Specialist pools reference that population through stable personnel IDs; they never create additional manpower.

## Invariants
- Personnel status buckets sum exactly to total personnel.
- Each personnel ID belongs to at most one specialist pool.
- Specialist pool size equals its personnel-ID count.
- Qualified + training equals specialist pool size.
- Veteran + experienced + trained equals qualified.
- Equipment total equals operational + damaged + destroyed.
- Assigned equipment cannot exceed operational equipment.
- Qualified crew availability caps usable equipment.
- Unknown legacy crew data is never inferred as a replacement.
- Combat resolution must not directly mutate authoritative resource state.
