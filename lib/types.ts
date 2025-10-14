export type ChargerMode = "OFF" | "REGEN" | "DOCK";

export interface SubPower {
  sensors: boolean;
  thrusters: boolean;
  weapons: boolean;
  comms: boolean;
  nav: boolean;
  solar: boolean;
}

export interface FrameHealth {
  head: number;
  torso: number;
  lArm: number;
  rArm: number;
  lLeg: number;
  rLeg: number;
}
export interface SubsHealth {
  sensors: number;
  thrusters: number;
  weaponMount: number;
}

export interface TargetTrack {
  x: number;
  y: number;
  distance: number;
  bearing: number;
}

export interface LogEntry {
  id: string;
  ch: string;
  text: string;
}
