import React from "react";
import { clamp } from "@/utils";

export default function SensorsMonitor({ enabled, lock, health }: { enabled: boolean; lock: number; health: number }) {
  if (!enabled) return <div className="text-[11px] text-yellow-300">OFFLINE</div>;
  return (
    <div className="text-xs space-y-2">
      <div className="flex items-center justify-between">
        <span>Lock</span>
        <span>{Math.round(lock)}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
        <div className="h-full bg-cyan-400" style={{ width: `${clamp(lock)}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span>Health</span>
        <span>{Math.round(health)}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
        <div className={`h-full ${health < 30 ? "bg-red-500" : "bg-emerald-400"}`} style={{ width: `${clamp(health)}%` }} />
      </div>
    </div>
  );
}
