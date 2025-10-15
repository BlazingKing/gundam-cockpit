import React from "react";
import { Gauge, Zap } from "lucide-react";
import { clamp } from "@/utils";

export default function ThrustersMonitor({
  enabled,
  throttle,
  onThrottle,
  speed,
  maxSpeed,
}: {
  enabled: boolean;
  throttle: number; // 0..100
  onThrottle: (v: number) => void; // setter จาก parent
  speed: number; // m/s
  maxSpeed: number; // m/s (ที่ทำได้ ณ ตอนนี้ ตามสภาพ thrusters)
}) {
  const pct = clamp((speed / Math.max(1, maxSpeed)) * 100, 0, 100);
  const set = (v: number) => onThrottle(clamp(Math.round(v), 0, 100));

  return (
    <div className="text-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1">
          <Zap size={14} /> Status
        </span>
        <span className={enabled ? "text-emerald-400" : "text-yellow-300"}>{enabled ? "ONLINE" : "OFFLINE"}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="opacity-80 text-[10px]">Speed</div>
          <div className="font-semibold">{Math.round(speed)} m/s</div>
        </div>
        <div className="text-right">
          <div className="opacity-80 text-[10px]">Max</div>
          <div className="font-semibold">{Math.round(maxSpeed)} m/s</div>
        </div>
      </div>

      {/* แถบความเร็วปัจจุบัน */}
      <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
        <div className="h-full bg-cyan-400" style={{ width: `${pct}%` }} />
      </div>

      {/* Throttle */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1">
          <Gauge size={14} /> Throttle
        </span>
        <span>{throttle}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={throttle}
        onChange={(e) => set(+e.target.value)}
        disabled={!enabled}
        className="w-full accent-cyan-400"
      />

      <div className="grid grid-cols-5 gap-2">
        {[0, 25, 50, 75, 100].map((v) => (
          <button
            key={v}
            className={`px-2 py-1 rounded border text-[11px] ${
              throttle === v ? "border-white/70" : "border-zinc-700"
            } ${!enabled ? "cursor-not-allowed opacity-60" : ""}`}
            onClick={() => enabled && set(v)}
          >
            {v}%
          </button>
        ))}
      </div>

      <div className="text-[10px] opacity-70">ปรับเป้าหมายความเร็วด้วย Throttle (0–100%). ระบบจะเร่ง/ผ่อนให้เข้าใกล้ความเร็วเป้าหมายโดยอัตโนมัติ</div>
    </div>
  );
}
