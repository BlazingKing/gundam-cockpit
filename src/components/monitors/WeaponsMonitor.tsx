import React from "react";
import { CFG } from "@/config";
import { clamp } from "@/utils";

export default function WeaponsMonitor({
  enabled,
  charge,
  transAm,
  burstCD,
}: {
  enabled: boolean;
  charge: number;
  transAm: boolean;
  burstCD: number;
}) {
  const ready = enabled && transAm && charge >= CFG.MIN_CHARGE_FOR_BURST && burstCD === 0;
  return (
    <div className="text-xs space-y-2">
      <div className="flex items-center justify-between">
        <span>Status</span>
        <span className={enabled ? "text-emerald-400" : "text-red-400"}>{enabled ? "ONLINE" : "LOCKED"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Charge</span>
        <span>{Math.round(charge)}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
        <div className={`h-full ${charge < CFG.MIN_CHARGE_FOR_BURST ? "bg-red-500" : "bg-cyan-400"}`} style={{ width: `${clamp(charge)}%` }} />
      </div>
      <div className="text-[10px] opacity-70">Burst {ready ? "READY" : "NOT READY"}</div>
    </div>
  );
}
