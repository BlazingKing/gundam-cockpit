import { ChargerMode } from "./types";
import { CFG } from "./config";

export function canEnableTransAmManual(powerOn: boolean, transAm: boolean, charger: ChargerMode, battery: number, charge: number) {
  if (!powerOn) return false;
  if (transAm) return true; // already ON → allow toggle off
  if (charger !== "OFF") return false; // block while charging
  if (battery < CFG.AUTO_MIN_BATT) return false;
  if (charge < CFG.MIN_CHARGE_FOR_MODE) return false;
  return true;
}

export const canPowerOnSystem = (battery: number, charger: ChargerMode) => battery >= 5 || charger !== "OFF";
