import React from "react";

export default function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/60 backdrop-blur border border-zinc-800 rounded-xl">
      <div className="px-3 pt-2 pb-1 text-sm flex items-center gap-2">
        {icon}
        {title}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
