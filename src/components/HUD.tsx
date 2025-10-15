import React from "react";
import { motion } from "framer-motion";
import { Gauge, Cloud } from "lucide-react";
import { relBearing } from "@/utils";

export type ChargerMode = "OFF" | "REGEN" | "DOCK";

export interface TargetTrack {
  x: number;
  y: number;
  distance: number;
  bearing: number;
}

export default function HUD({
  powerOn,
  hudOn,
  gnFX,
  transAm,
  burstActive,
  charge,
  lock,
  battery,
  charger,
  pitch,
  roll,
  speed,
  alt,
  heading,
  targets = [],
  sensorsOnline,
  onRequestPower,
}: {
  powerOn: boolean;
  hudOn: boolean;
  gnFX: boolean;
  transAm: boolean;
  burstActive: boolean;
  charge: number;
  lock: number;
  battery: number;
  charger: ChargerMode;
  pitch: number;
  roll: number;
  speed: number;
  alt: number;
  heading: number;
  targets?: TargetTrack[];
  sensorsOnline: boolean;
  onRequestPower: () => void;
}) {
  return (
    <div
      className={`relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-gradient-to-b from-zinc-900 to-black ${transAm ? "[box-shadow:0_0_30px_theme(colors.red.600/.45),inset_0_0_60px_theme(colors.red.600/.12)]" : "[box-shadow:0_0_30px_theme(colors.cyan.500/.45),inset_0_0_60px_theme(colors.cyan.500/.10)]"}`}
    >
      {/* GN particles */}
      {gnFX && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => {
            const left = `${(i * 37) % 100}%`;
            const delay = (i % 12) * 0.25;
            const dur = 4 + (i % 5);
            return (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ left, bottom: -10 }}
                animate={{ y: [-10, -140], opacity: [0, 1, 0] }}
                transition={{ duration: dur, repeat: Infinity, ease: "linear", delay }}
              >
                <div className={`w-full h-full ${transAm ? "bg-red-400" : "bg-cyan-300"} blur-[1px]`} />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* OFFLINE overlay */}
      {!powerOn && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 text-center">
          <div className="text-xl font-semibold">SYSTEM OFFLINE</div>
          <div className="text-xs opacity-80">Battery depleted or inactive. Connect charger or wait for regen.</div>
          <button
            className={`px-3 py-1 rounded border text-xs ${battery >= 5 || charger !== "OFF" ? "border-white/60" : "border-zinc-700 text-zinc-400 cursor-not-allowed"}`}
            onClick={onRequestPower}
          >
            Power On
          </button>
        </div>
      )}

      {/* HUD layers */}
      {hudOn && powerOn && (
        <>
          {/* Panorama: Horizon (pitch/roll) */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute left-0 right-0 top-1/2 h-px bg-white/20"
              style={{ transform: `translateY(${-pitch * 1.2}px) rotate(${roll}deg)` }}
            />
            {/* minor horizon ticks */}
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 w-8 h-px bg-white/10"
                style={{ top: `calc(50% + ${(i - 4) * 12 - pitch * 1.2}px)`, transform: `translateX(-50%) rotate(${roll}deg)` }}
              />
            ))}
          </div>

          {/* Readouts */}
          <div className="absolute left-3 top-3 text-xs">
            <div className="flex items-center gap-1">
              <Gauge size={14} /> SPD {Math.round(speed)} m/s
            </div>
            <div className="flex items-center gap-1">
              <Cloud size={14} /> ALT {Math.round(alt)} m
            </div>
          </div>
          <div className="absolute right-3 top-3 text-[10px] text-right opacity-90">
            <div>YAW {heading}°</div>
            <div>PITCH {pitch.toFixed(1)}°</div>
            <div>ROLL {roll.toFixed(1)}°</div>
          </div>

          {/* GN sync & charge bars */}
          <div className="absolute left-3 bottom-10 right-3">
            <div className="text-[10px] mb-1 opacity-80">GN PARTICLE SYNC</div>
            <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
              <div className={`h-full ${transAm ? "bg-red-500" : "bg-cyan-400"}`} style={{ width: `${lock}%` }} />
            </div>
          </div>
          <div className="absolute left-3 bottom-4 right-3">
            <div className="flex items-center justify-between text-[10px] mb-1 opacity-80">
              <span>TRANS-AM CHARGE {burstActive ? "(Burst)" : ""}</span>
              <span>{Math.round(charge)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded overflow-hidden">
              <div className={`h-full ${transAm ? "bg-red-400" : "bg-cyan-400"}`} style={{ width: `${charge}%` }} />
            </div>
          </div>

          {sensorsOnline &&
            targets.map((t, i) => (
              <div key={i} className="absolute" style={{ left: `calc(${t.x}% - 10px)`, top: `calc(${t.y}% - 10px)` }}>
                <div className="w-5 h-5 border-2 border-emerald-400 animate-pulse" />
                <div className="text-[10px] mt-1 text-emerald-300">
                  {Math.round(t.distance)} m · {Math.round(t.bearing)}° · {Math.round(relBearing(t.bearing, heading))}° REL · LOCK {Math.round(lock)}%
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
