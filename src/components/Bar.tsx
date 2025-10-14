import React from "react";
import { clamp } from "@/utils";

export default function Bar({ label, value, children, trail }: { label: string; value: number; children?: React.ReactNode; trail?: boolean }) {
  return (
    <div className="text-xs">
      <div className="flex items-center justify-between mb-1">
        <span className="inline-flex items-center gap-1">
          {children}
          {label}
        </span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded overflow-hidden">
        <div className={`h-full ${value < 20 ? "bg-red-500" : "bg-cyan-400"}`} style={{ width: `${clamp(value)}%` }} />
      </div>
      {trail && <div className="mt-1 text-[10px] opacity-70">Charger: OFF/REGEN/DOCK</div>}
    </div>
  );
}
