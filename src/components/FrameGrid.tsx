import React from "react";
import { clamp } from "@/utils";
import { FrameHealth } from "@/types";

function BarMini({ v }: { v: number }) {
  return (
    <div className="h-1 bg-zinc-800 rounded overflow-hidden">
      <div className={`h-full ${v > 50 ? "bg-emerald-400" : v > 20 ? "bg-yellow-400" : "bg-red-500"}`} style={{ width: `${clamp(v)}%` }} />
    </div>
  );
}

export default function FrameGrid({ frame }: { frame: FrameHealth }) {
  const Box = ({ name, v }: { name: string; v: number }) => (
    <div
      className={`p-2 rounded-md border ${v > 50 ? "border-emerald-700/50" : v > 20 ? "border-yellow-700/50" : "border-red-700/60"} ${v > 50 ? "bg-emerald-900/10" : v > 20 ? "bg-yellow-900/10" : "bg-red-900/10"}`}
    >
      <div className="flex items-center justify-between text-[11px]">
        <span>{name}</span>
        <span>{Math.round(v)}%</span>
      </div>
      <BarMini v={v} />
    </div>
  );
  return (
    <div className="grid grid-cols-3 grid-rows-4 gap-2 text-[11px]">
      <div className="col-start-2">
        <Box name="HEAD" v={frame.head} />
      </div>
      <div className="row-start-2 col-start-1">
        <Box name="L-ARM" v={frame.lArm} />
      </div>
      <div className="row-start-2 col-start-2">
        <Box name="TORSO" v={frame.torso} />
      </div>
      <div className="row-start-2 col-start-3">
        <Box name="R-ARM" v={frame.rArm} />
      </div>
      <div className="row-start-3 col-start-1">
        <Box name="L-LEG" v={frame.lLeg} />
      </div>
      <div className="row-start-3 col-start-3">
        <Box name="R-LEG" v={frame.rLeg} />
      </div>
    </div>
  );
}
