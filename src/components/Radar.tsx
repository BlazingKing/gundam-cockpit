import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CFG } from "@/config";
import { rnd, uid } from "@/utils";
import { TargetTrack } from "@/types";

export default function Radar({
  power,
  sensors,
  lock,
  onTrack,
}: {
  power: boolean;
  sensors: boolean;
  lock: number;
  onTrack: (d: TargetTrack) => void;
}) {
  const [blips, setBlips] = useState<{ id: string; x: number; y: number; life: number }[]>([]);
  const [hover, setHover] = useState<{ id: string; x: number; y: number; dist: number; brg: number } | null>(null);
  const [tracked, setTracked] = useState<string | null>(null);

  const toMeters = (x: number, y: number) => {
    const dx = x - 50,
      dy = y - 50;
    return (Math.sqrt(dx * dx + dy * dy) / 50) * CFG.RADAR_RANGE_M;
  };
  const bearing = (x: number, y: number) => {
    const dx = x - 50,
      dy = y - 50;
    const rad = Math.atan2(dx, -dy);
    return ((rad * 180) / Math.PI + 360) % 360;
  };

  useEffect(() => {
    if (!power || !sensors) return;
    const add = setInterval(() => {
      if (Math.random() < 0.35 + lock / 300) {
        const r = rnd(8, 48),
          a = rnd(0, 2 * Math.PI);
        const x = 50 + r * Math.cos(a),
          y = 50 + r * Math.sin(a);
        setBlips((B) => [...B, { id: uid(), x, y, life: 100 }].slice(-50));
      }
    }, 480);
    const decay = setInterval(() => setBlips((B) => B.map((b) => ({ ...b, life: b.life - 4 })).filter((b) => b.life > 0)), 120);
    return () => {
      clearInterval(add);
      clearInterval(decay);
    };
  }, [power, sensors, lock]);

  return (
    <div className="relative w-full" style={{ aspectRatio: "1/1" }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0">
        <rect x="0" y="0" width="100" height="100" fill="none" />
        {[45, 35, 25, 15].map((r, i) => (
          <circle key={i} cx="50" cy="50" r={r} className="stroke-zinc-800 fill-none" />
        ))}
        <line x1="0" y1="50" x2="100" y2="50" className="stroke-zinc-800" />
        <line x1="50" y1="0" x2="50" y2="100" className="stroke-zinc-800" />
        {Array.from({ length: 9 }).map((_, i) => (
          <g key={i}>
            <line x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" className="stroke-zinc-900" />
            <line x1="0" y1={(i + 1) * 10} x2="100" y2="100" className="stroke-zinc-900" />
          </g>
        ))}
      </svg>
      {power && sensors && (
        <motion.div
          className="absolute left-1/2 top-1/2 origin-left h-[1px] w-1/2 bg-cyan-400/60"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: "linear", duration: 2.0 }}
        />
      )}
      {blips.map((b) => {
        const dist = toMeters(b.x, b.y),
          brg = bearing(b.x, b.y),
          mark = tracked === b.id ? "ring-2 ring-emerald-400" : "";
        return (
          <div
            key={b.id}
            className={`absolute w-1.5 h-1.5 rounded-full bg-emerald-400 ${mark}`}
            style={{ left: `calc(${b.x}% - 3px)`, top: `calc(${b.y}% - 3px)`, opacity: b.life / 100 }}
            onMouseEnter={() => setHover({ id: b.id, x: b.x, y: b.y, dist, brg })}
            onMouseLeave={() => setHover((h) => (h && h.id === b.id ? null : h))}
            onDoubleClick={() => {
              setTracked(b.id);
              onTrack({ x: b.x, y: b.y, distance: dist, bearing: brg });
            }}
          />
        );
      })}
      {hover && (
        <div
          className="absolute text-[10px] px-2 py-1 rounded bg-zinc-900/90 border border-zinc-700"
          style={{ left: `calc(${hover.x}% + 6px)`, top: `calc(${hover.y}% + 6px)` }}
        >
          (x:{hover.x.toFixed(1)}, y:{hover.y.toFixed(1)}) · {Math.round(hover.dist)} m · {Math.round(hover.brg)}°
        </div>
      )}
      {tracked &&
        (() => {
          const t = blips.find((b) => b.id === tracked);
          if (!t) return null;
          return (
            <div className="absolute pointer-events-none" style={{ left: `calc(${t.x}% - 8px)`, top: `calc(${t.y}% - 8px)` }}>
              <div className="w-4 h-4 rounded-full border-2 border-emerald-400 animate-ping" />
            </div>
          );
        })()}
      <div className="absolute inset-0 rounded-md border border-zinc-800 pointer-events-none" />
    </div>
  );
}
