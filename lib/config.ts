// Tunable constants (single source of truth)
export const CFG = {
  AUTO_MIN_BATT: 30,
  MIN_CHARGE_FOR_MODE: 20,
  MIN_CHARGE_FOR_BURST: 15,
  BURST_MS: 3000,
  BURST_CD: 12000,
  OVERHEAT: 92,
  LOW_BATT: 20,
  RADAR_RANGE_M: 1500,
  LOCK_PING: 75,
  PING_COOLDOWN: 3500,
} as const;
