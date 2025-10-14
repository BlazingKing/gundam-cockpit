// Lightweight runtime asserts (runs in dev only)
import { canEnableTransAmManual, canPowerOnSystem } from "./logic";
import { clamp, relBearing } from "./utils";
import { CFG } from "./config";

export function runRuntimeAsserts() {
  try {
    console.assert(canEnableTransAmManual(true, false, "OFF", 50, 30) === true, "TA enable ok");
    console.assert(canEnableTransAmManual(true, false, "REGEN", 50, 30) === false, "TA blocked while charging");
    console.assert(canPowerOnSystem(0, "DOCK") === true, "PowerOn via dock");
    console.assert(CFG.RADAR_RANGE_M === 1500, "Radar 1500m");
    console.assert(relBearing(10, 350) === 20, "relBearing wrap +");
    console.assert(relBearing(350, 10) === -20, "relBearing wrap -");
    console.assert(clamp(-5, 0, 100) === 0 && clamp(120, 0, 100) === 100, "clamp bounds");
  } catch (e) {
    console.warn("[runtime-tests] assert failed", e);
  }
}
