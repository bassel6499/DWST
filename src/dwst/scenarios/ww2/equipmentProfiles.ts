export interface WW2EquipmentProfile {
  readonly armor: number;
  readonly antiArmor: number;
  readonly artillery: number;
  readonly air: number;
  readonly infantry: number;
  readonly mobility: number;
}

/**
 * Relative WW2 model coefficients, not historical performance measurements.
 * These profiles only distinguish equipment already represented by canonical
 * scenario definitions. Empirical calibration remains a separate task.
 */
export const WW2_EQUIPMENT_PROFILES: Readonly<Record<string, WW2EquipmentProfile>> = Object.freeze({
  'ww2-pziv': Object.freeze({ armor: 0.55, antiArmor: 0.55, artillery: 0, air: 0, infantry: 0, mobility: 0.55 }),
  'ww2-panther': Object.freeze({ armor: 0.75, antiArmor: 0.80, artillery: 0, air: 0, infantry: 0, mobility: 0.70 }),
  'ww2-tiger-ii': Object.freeze({ armor: 0.95, antiArmor: 0.95, artillery: 0, air: 0, infantry: 0, mobility: 0.35 }),
  'ww2-stug-iii': Object.freeze({ armor: 0.65, antiArmor: 0.75, artillery: 0, air: 0, infantry: 0, mobility: 0.55 }),
  'ww2-jagdpanzer-iv70': Object.freeze({ armor: 0.75, antiArmor: 0.90, artillery: 0, air: 0, infantry: 0, mobility: 0.55 }),
  'us-m4-sherman': Object.freeze({ armor: 0.55, antiArmor: 0.55, artillery: 0, air: 0, infantry: 0, mobility: 0.65 }),
  'us-m5-stuart': Object.freeze({ armor: 0.25, antiArmor: 0.20, artillery: 0, air: 0, infantry: 0, mobility: 0.85 }),
});

export const DEFAULT_WW2_EQUIPMENT_PROFILE: WW2EquipmentProfile = Object.freeze({
  armor: 0.50,
  antiArmor: 0.50,
  artillery: 0,
  air: 0,
  infantry: 0,
  mobility: 0.50,
});
