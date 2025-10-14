import React from "react";

export default function SolarMonitor({ enabled, battery, stats }: { enabled: boolean; battery: number; stats: { saved: number; load: number } }) {
  if (!enabled) return <div className="text-[11px] text-yellow-300">OFFLINE</div>;
  return (
    <div className="text-xs space-y-1">
      <div className="text-emerald-400">SOLAR: ONLINE (no battery drain)</div>
      <div className="text-[10px] opacity-80">Battery {Math.round(battery)}%</div>
      <div className="text-[10px]">
        Harvested (covered load): <span className="text-emerald-300">{stats.saved.toFixed(1)}</span> %-pts
      </div>
      <div className="text-[10px] opacity-80">Covered this session: {stats.load.toFixed(1)} %-pts</div>
    </div>
  );
}
