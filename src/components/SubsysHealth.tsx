import React from "react";
import { clamp } from "@/utils";
import { SubsHealth } from "@/types";

function Item({ name, v }: { name: string; v: number }) {
  return (
    <div className={`p-2 rounded-md border ${v > 50 ? "border-emerald-700/50 bg-emerald-900/10" : "border-red-700/40 bg-red-900/10"} text-[11px]`}>
      <div className="flex items-center justify-between">
        <span>{name}</span>
        <span>{Math.round(v)}%</span>
      </div>
      <div className="h-1 bg-zinc-800 rounded overflow-hidden">
        <div className={`h-full ${v > 50 ? "bg-emerald-400" : v > 20 ? "bg-yellow-400" : "bg-red-500"}`} style={{ width: `${clamp(v)}%` }} />
      </div>
    </div>
  );
}

export default function SubsysHealth({ subs }: { subs: SubsHealth }) {
  return (
    <div className="space-y-2">
      <Item name="Sensors" v={subs.sensors} />
      <Item name="Thrusters" v={subs.thrusters} />
      <Item name="Weapon Mount" v={subs.weaponMount} />
    </div>
  );
}
