export interface WW2AttritionResult {
  readonly attackerRemaining: number;
  readonly defenderRemaining: number;
  readonly attackerLosses: number;
  readonly defenderLosses: number;
}

/** Stable 24-step RK4 integration of dA/dt=-beta B²/A and dB/dt=-alpha A²/B. */
export function resolveAttrition(
  attackerPersonnel: number,
  defenderPersonnel: number,
  alpha: number,
  beta: number,
): WW2AttritionResult {
  const steps = 24;
  const dt = 1 / steps;
  let attackerRemaining = attackerPersonnel;
  let defenderRemaining = defenderPersonnel;
  const derivative = (a: number, b: number): [number, number] => [
    -Math.min(a, beta * b * b / Math.max(a, 1)),
    -Math.min(b, alpha * a * a / Math.max(b, 1)),
  ];

  for (let step = 0; step < steps && attackerRemaining > 0 && defenderRemaining > 0; step += 1) {
    const [k1a, k1b] = derivative(attackerRemaining, defenderRemaining);
    const [k2a, k2b] = derivative(
      Math.max(0, attackerRemaining + k1a * dt / 2),
      Math.max(0, defenderRemaining + k1b * dt / 2),
    );
    const [k3a, k3b] = derivative(
      Math.max(0, attackerRemaining + k2a * dt / 2),
      Math.max(0, defenderRemaining + k2b * dt / 2),
    );
    const [k4a, k4b] = derivative(
      Math.max(0, attackerRemaining + k3a * dt),
      Math.max(0, defenderRemaining + k3b * dt),
    );
    attackerRemaining = Math.max(
      0,
      attackerRemaining + (k1a + 2 * k2a + 2 * k3a + k4a) * dt / 6,
    );
    defenderRemaining = Math.max(
      0,
      defenderRemaining + (k1b + 2 * k2b + 2 * k3b + k4b) * dt / 6,
    );
  }

  return {
    attackerRemaining,
    defenderRemaining,
    attackerLosses: Math.min(
      attackerPersonnel,
      Math.max(0, Math.round(attackerPersonnel - attackerRemaining)),
    ),
    defenderLosses: Math.min(
      defenderPersonnel,
      Math.max(0, Math.round(defenderPersonnel - defenderRemaining)),
    ),
  };
}
