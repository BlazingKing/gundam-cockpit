import React from "react";
import { clamp } from "@/utils";

export default function CommsMonitor({
  enabled,
  mode,
  live,
  muted,
  level,
}: {
  enabled: boolean;
  mode: "VOICE" | "VIDEO";
  live: boolean;
  muted: boolean;
  level: number;
}) {
  if (!enabled) return <div className="text-[11px] text-yellow-300">OFFLINE</div>;
  const q = Math.round(level);
  return (
    <div className="text-xs space-y-2">
      <div className="flex items-center justify-between">
        <span>Status</span>
        <span>{live ? "LIVE" : "IDLE"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Mode</span>
        <span>{mode}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Mute</span>
        <span>{muted ? "ON" : "OFF"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Signal</span>
        <span>{q}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
        <div className={`h-full ${q < 30 ? "bg-red-500" : q < 60 ? "bg-yellow-400" : "bg-emerald-400"}`} style={{ width: `${clamp(q)}%` }} />
      </div>
    </div>
  );
}
