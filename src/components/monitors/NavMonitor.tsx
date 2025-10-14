import React from "react";
import { Compass } from "lucide-react";

export default function NavMonitor({ enabled, speed, alt, heading }: { enabled: boolean; speed: number; alt: number; heading: number }) {
  if (!enabled) return <div className="text-[11px] text-yellow-300">OFFLINE</div>;
  return (
    <div className="text-xs grid grid-cols-3 gap-2 items-center">
      <div>
        <div className="opacity-80 text-[10px]">Speed</div>
        <div className="font-semibold">{Math.round(speed)} m/s</div>
      </div>
      <div>
        <div className="opacity-80 text-[10px]">Altitude</div>
        <div className="font-semibold">{Math.round(alt)} m</div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Compass size={16} />
        <span className="font-semibold">{heading}&deg;</span>
      </div>
    </div>
  );
}
