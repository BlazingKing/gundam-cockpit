import React from "react";
import { clamp } from "@/utils";

export default function Radial({ label, value, color }: { label: string; value: number; color: "red" | "cyan" }) {
  const size = 110,
    stroke = 10,
    r = (size - stroke) / 2,
    c = 2 * Math.PI * r;
  const pct = clamp(value) / 100;
  const dash = c * pct;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="stroke-white/20 fill-none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          className={color === "red" ? "stroke-red-400" : "stroke-cyan-400"}
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          fill="none"
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-white text-xl font-bold">
          {Math.round(value)}
        </text>
      </svg>
      <div className="text-xs -mt-1">{label}</div>
    </div>
  );
}
