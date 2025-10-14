/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BatteryFull,
  Gauge,
  Cloud,
  Zap,
  FlameKindling,
  PlugZap,
  Sparkles,
  Radio,
  PhoneCall,
  PhoneOff,
  Video,
  Mic,
  Volume2,
  VolumeX,
  Power,
  User,
  Compass,
  Radar as RadarIcon,
} from "lucide-react";
import Panel from "@/components/Panel";
import Bar from "@/components/Bar";
import Radial from "@/components/Radial";
import FrameGrid from "@/components/FrameGrid";
import SubsysHealth from "@/components/SubsysHealth";
import SensorsMonitor from "@/components/monitors/SensorsMonitor";
import NavMonitor from "@/components/monitors/NavMonitor";
import WeaponsMonitor from "@/components/monitors/WeaponsMonitor";
import CommsMonitor from "@/components/monitors/CommsMonitor";
import SolarMonitor from "@/components/monitors/SolarMonitor";
import Radar from "@/components/Radar";

import { CFG } from "@/config";
import { clamp, rnd, relBearing, uid } from "@/utils";
import { canEnableTransAmManual, canPowerOnSystem } from "@/logic";
import { FrameHealth, SubsHealth, SubPower, TargetTrack, LogEntry, ChargerMode } from "@/types";
import { runRuntimeAsserts } from "@/runtime-tests";
import HUD from "@/components/HUD";

export default function Home() {
  // power & modes
  const [powerOn, setPowerOn] = useState(false);
  const [transAm, setTransAm] = useState(false);
  const [burst, setBurst] = useState(false);
  const [burstCD, setBurstCD] = useState(0);
  const [gnFX, setGnFX] = useState(true);
  const [coolCD, setCoolCD] = useState(0);
  const [charge, setCharge] = useState(100);
  const [battery, setBattery] = useState(100);
  const [reactor, setReactor] = useState(18);
  const [heat, setHeat] = useState(22);
  const [speed, setSpeed] = useState(0);
  const [alt, setAlt] = useState(120);
  const [yaw, setYaw] = useState(90);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [lock, setLock] = useState(0);
  const [pilot, setPilot] = useState("Pilot");
  const [askName, setAskName] = useState(true);
  const [tempName, setTempName] = useState("");
  const [welcome, setWelcome] = useState<string | null>(null);
  const [charger, setCharger] = useState<ChargerMode>("OFF");
  const [hudOn] = useState(true);
  const [sub, setSub] = useState<SubPower>({ sensors: false, thrusters: false, weapons: false, comms: false, nav: false, solar: false });
  const [solarStats, setSolarStats] = useState({ saved: 0, load: 0 });

  // health
  const [frame, setFrame] = useState<FrameHealth>({ head: 100, torso: 100, lArm: 100, rArm: 100, lLeg: 100, rLeg: 100 });
  const [subs, setSubs] = useState<SubsHealth>({ sensors: 100, thrusters: 100, weaponMount: 100 });

  // comms
  const [log, setLog] = useState<LogEntry[]>([{ id: uid(), ch: "Celestial Being", text: "Systems standby." }]);
  const logRef = useRef<HTMLDivElement | null>(null);
  const pushLog = (ch: string, text: string) => setLog((L) => [...L, { id: uid(), ch, text }].slice(-28));
  const [callOn, setCallOn] = useState(false);
  const [mode, setMode] = useState<"VOICE" | "VIDEO">("VOICE");
  const [muted, setMuted] = useState(false);
  const [sig, setSig] = useState(0);

  // target from radar
  const [target, setTarget] = useState<TargetTrack | null>(null);
  const lastPing = useRef(0),
    lastBattWarn = useRef(0);

  // housekeeping
  useEffect(() => {
    runRuntimeAsserts();
  }, []);
  useEffect(() => {
    if (!powerOn) setSub({ sensors: false, thrusters: false, weapons: false, comms: false, nav: false, solar: false });
  }, [powerOn]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);
  useEffect(() => {
    if (!callOn || !sub.comms) return;
    const t = setInterval(() => setSig(Math.floor(rnd(5, 95))), 240);
    return () => clearInterval(t);
  }, [callOn, sub.comms]);
  useEffect(() => {
    if (burstCD <= 0) return;
    const t = setInterval(() => setBurstCD((c) => Math.max(0, c - 1000)), 1000);
    return () => clearInterval(t);
  }, [burstCD]);
  useEffect(() => {
    if (coolCD <= 0) return;
    const t = setInterval(() => setCoolCD((c) => Math.max(0, c - 1000)), 1000);
    return () => clearInterval(t);
  }, [coolCD]);

  // ambience
  useEffect(() => {
    if (!sub.comms) return;
    const lines = ["Lock on.", "Trans-Am ready.", "GN particles stable.", "Target acquired.", "Maintain formation.", "Enemy on vector."];
    const t = setInterval(() => pushLog("Celestial Being", lines[Math.floor(Math.random() * lines.length)]), 3500);
    return () => clearInterval(t);
  }, [sub.comms]);

  // simulation ticker
  useEffect(() => {
    const t = setInterval(() => {
      if (!powerOn) {
        setBattery((b) => clamp(b + (charger === "DOCK" ? 0.18 : 0) + (charger === "REGEN" ? 0.04 : 0), 0, 100));
        setReactor(0);
        setHeat(0);
        setSpeed(0);
        setAlt(0);
        setLock(0);
        setCharge(0);
        return;
      }
      const thrOK = sub.thrusters,
        sensOK = sub.sensors,
        navOK = sub.nav;
      const thrEff = (thrOK ? subs.thrusters : 0) / 100;
      const sensEff = Math.max(0.35, (sensOK ? subs.sensors : 0) / 100);
      const boost = (transAm ? 1.6 : 1) * (burst ? 2.2 : 1) * (0.85 + 0.15 * thrEff);
      setSpeed((s) => (thrOK ? clamp(s + (40 - s) * 0.03 * boost, 0, 640 * thrEff + 60) : Math.max(0, s - 4)));
      setAlt((a) => (navOK ? clamp(a + rnd(-1, 2) + speed * 0.02, 0, 5000) : Math.max(0, a - 1)));
      setLock((l) =>
        sensOK ? clamp(Math.min(100 * sensEff, l + (Math.random() > 0.7 ? rnd(1, 3) * boost * sensEff : -rnd(0, 1))), 0, 100) : Math.max(0, l - 2)
      );
      setReactor((r) => clamp(r + (boost ? 0.4 : 0.2) + (hudOn ? 0.02 : 0) - 0.25, 0, 100));
      setPitch((p) => clamp(p + (thrOK ? rnd(-0.25, 0.25) : rnd(-0.1, 0.1)) + (speed - 200) * 0.0005 - (navOK ? 0.02 : 0), -20, 20));
      setRoll((r) => clamp(r + (thrOK ? rnd(-0.4, 0.4) : rnd(-0.15, 0.15)) + (Math.random() - 0.5) * 0.2, -25, 25));
      setYaw((h) => (navOK ? Math.floor((h + 0.6 + speed / 200) % 360) : h));
      setHeat((h) =>
        clamp(
          h +
            (reactor / 100) * 0.35 +
            (transAm ? 0.55 : 0) +
            (burst ? 0.9 : 0) +
            (speed > 300 ? 0.12 : 0) -
            (charger === "DOCK" ? 0.25 : 0) -
            (thrOK ? 0.08 : 0) -
            0.16,
          0,
          100
        )
      );
      setBattery((b) => {
        let base =
          -(transAm ? 0.22 : 0.06) -
          (hudOn ? 0.02 : 0) -
          (burst ? 0.25 : 0) +
          (charger === "DOCK" ? 0.12 : 0) +
          (charger === "REGEN" && speed > 5 ? 0.03 : 0);
        if (sub.solar) {
          const load = Math.max(0, -base);
          if (load > 0) setSolarStats((s) => ({ saved: +(s.saved + load).toFixed(2), load: +(s.load + load).toFixed(2) }));
          base = Math.max(base, 0);
        }
        return clamp(b + base, 0, 100);
      });
      setCharge((c) => clamp(c + (transAm ? -0.35 : 0.18) + (burst ? -0.8 : 0), 0, 100));
      // wear / repair
      const risky = reactor > 92 || transAm || burst || heat > CFG.OVERHEAT;
      setFrame((f) => {
        const nf = { ...f };
        if (risky && Math.random() < 0.04) {
          const ks = ["head", "torso", "lArm", "rArm", "lLeg", "rLeg"] as const;
          const k = ks[Math.floor(Math.random() * ks.length)];
          (nf as any)[k] = clamp((nf as any)[k] - rnd(1, 3), 0, 100);
        }
        if (charger === "DOCK") {
          (nf as any).head = clamp(nf.head + 0.12, 0, 100);
          (nf as any).torso = clamp(nf.torso + 0.12, 0, 100);
          (nf as any).lArm = clamp(nf.lArm + 0.12, 0, 100);
          (nf as any).rArm = clamp(nf.rArm + 0.12, 0, 100);
          (nf as any).lLeg = clamp(nf.lLeg + 0.12, 0, 100);
          (nf as any).rLeg = clamp(nf.rLeg + 0.12, 0, 100);
        }
        return nf;
      });
      setSubs((s) => ({
        weaponMount: clamp(s.weaponMount - (transAm ? 0.08 : 0.04) - (burst ? 0.12 : 0) + (charger === "DOCK" ? 0.15 : 0), 0, 100),
        sensors: clamp(
          s.sensors - ((transAm ? 0.08 : 0.04) + (burst ? 0.12 : 0)) * (lock > 70 ? 0.7 : 0.3) + (charger === "DOCK" ? 0.12 : 0),
          0,
          100
        ),
        thrusters: clamp(
          s.thrusters - ((transAm ? 0.08 : 0.04) + (burst ? 0.12 : 0)) * (speed > 300 ? 1.4 : 0.4) + (charger === "DOCK" ? 0.14 : 0),
          0,
          100
        ),
      }));
      if (heat > CFG.OVERHEAT) pushLog("System", `WARNING: OVERHEAT ${Math.round(heat)}%`);
      if (battery <= CFG.LOW_BATT) {
        const now = Date.now();
        if (now - lastBattWarn.current > 5000) {
          lastBattWarn.current = now;
          pushLog("System", `BATTERY LOW ${Math.round(battery)}%`);
        }
      }
      if (lock >= CFG.LOCK_PING && sub.sensors) {
        const now = Date.now();
        if (now - lastPing.current > CFG.PING_COOLDOWN) {
          lastPing.current = now;
          pushLog("Sensor", `Ping: target lock ${Math.round(lock)}%`);
        }
      }
      if (battery <= 0 && powerOn) {
        setPowerOn(false);
        setTransAm(false);
        setBurst(false);
        setSpeed(0);
        setAlt(0);
        setLock(0);
        setReactor(0);
        setCharge(0);
        setHeat(0);
      }
    }, 80);
    return () => clearInterval(t);
  }, [powerOn, sub, transAm, burst, charger, speed, subs, reactor, heat, lock, battery, hudOn]);

  const togglePower = () => {
    if (powerOn) {
      setPowerOn(false);
      setTransAm(false);
      setBurst(false);
      setSub({ sensors: false, thrusters: false, weapons: false, comms: false, nav: false, solar: false });
    } else {
      setTempName(pilot === "Pilot" ? "" : pilot);
      setAskName(true);
    }
  };
  const confirmPower = () => {
    if (!(battery >= 5 || charger !== "OFF")) return;
    const name = (tempName || "Pilot").trim();
    setPilot(name);
    setAskName(false);
    setPowerOn(true);
    setSub({ sensors: false, thrusters: false, weapons: false, comms: false, nav: false, solar: false });
    const msg = `Welcome, ${name}.`;
    setWelcome(msg);
    pushLog("System", msg);
    setTimeout(() => setWelcome(null), 3000);
  };
  const canTA = canEnableTransAmManual(powerOn, transAm, charger, battery, charge) && sub.weapons;
  const triggerBurst = () => {
    if (!(powerOn && transAm && sub.weapons && charge >= CFG.MIN_CHARGE_FOR_BURST && burstCD === 0)) return;
    setBurst(true);
    setBurstCD(CFG.BURST_CD);
    pushLog("Celestial Being", "Trans-Am Burst!");
    setTimeout(() => setBurst(false), CFG.BURST_MS);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-6">
      {welcome && (
        <div className="fixed left-1/2 -translate-x-1/2 top-4 z-50 px-4 py-2 rounded-lg border border-emerald-500 bg-emerald-900/20 text-sm">
          {welcome}
        </div>
      )}

      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-cyan-600 text-white text-xs">GN-0000 00</span>
          <span className="px-2 py-1 rounded border border-cyan-600/60 text-white text-xs">GN Drive</span>
          <span className={`px-2 py-1 rounded border text-xs ${transAm ? "border-red-600" : "border-cyan-600"}`}>
            {transAm ? "TRANS-AM ACTIVE" : "STANDBY"}
          </span>
          <span className="px-2 py-1 rounded border border-white/30 text-white text-xs inline-flex items-center gap-1">
            <User size={12} /> {pilot}
          </span>
          {burstCD > 0 && (
            <span className="px-2 py-1 rounded border border-red-600/60 text-red-300 text-xs">Burst CD: {Math.ceil(burstCD / 1000)}s</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded text-xs border inline-flex items-center gap-1 ${powerOn ? "border-emerald-500" : "border-white/60"}`}
            onClick={togglePower}
          >
            <Power size={14} /> {powerOn ? "Power Off" : "Power On"}
          </button>
          <button
            className={`px-3 py-1 rounded border text-xs ${canTA ? "border-white/40" : "border-zinc-700 text-zinc-400 cursor-not-allowed"}`}
            onClick={() => canTA && setTransAm((v) => !v)}
          >
            <span className="inline-flex items-center gap-1">
              <FlameKindling size={14} />
              {transAm ? "Disable TRANS-AM" : "Enable TRANS-AM"}
            </span>
          </button>
          <button
            className={`px-3 py-1 rounded border text-xs ${powerOn && transAm && charge >= CFG.MIN_CHARGE_FOR_BURST && burstCD === 0 && sub.weapons ? "border-white/60" : "border-zinc-700 text-zinc-400 cursor-not-allowed"}`}
            onClick={triggerBurst}
          >
            Burst
          </button>
          <button
            className={`px-3 py-1 rounded border text-xs ${powerOn && coolCD === 0 ? "border-white/60" : "border-zinc-700 text-zinc-400 cursor-not-allowed"}`}
            onClick={() => {
              if (!powerOn || coolCD > 0) return;
              setHeat((h) => Math.max(0, h - 18));
              setCoolCD(15000);
              pushLog("System", "Manual coolant vent initiated (-18 heat)");
            }}
          >
            Vent
          </button>
          {coolCD > 0 && (
            <span className="px-2 py-1 rounded border border-sky-700/60 text-sky-300 text-xs">Vent CD: {Math.ceil(coolCD / 1000)}s</span>
          )}
          <div className="flex items-center gap-1 ml-2">
            <span className="px-2 py-1 rounded border border-zinc-700 text-xs inline-flex items-center gap-1">
              <PlugZap size={12} />
              Charger
            </span>
            {(["OFF", "REGEN", "DOCK"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setCharger(m)}
                className={`px-2 py-1 rounded text-xs border ${charger === m ? "border-white/70" : "border-zinc-700"}`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="px-2 py-1 rounded border border-zinc-700 text-xs">GN FX</span>
            <button onClick={() => setGnFX((v) => !v)} className={`px-2 py-1 rounded text-xs border ${gnFX ? "border-white/70" : "border-zinc-700"}`}>
              {gnFX ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div>

      {/* name prompt */}
      {askName && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900/90 border border-zinc-700 rounded-xl p-4">
            <div className="text-sm mb-2">Enter pilot name to initialize systems</div>
            <input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              autoFocus
              placeholder="Pilot name"
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 outline-none focus:border-cyan-500 text-sm"
            />
            <div className="flex justify-end gap-2 mt-3 text-xs">
              <button className="px-3 py-1 rounded border border-zinc-700" onClick={() => setAskName(false)}>
                Cancel
              </button>
              <button
                className={`px-3 py-1 rounded border ${tempName.trim().length > 0 && (battery >= 5 || charger !== "OFF") ? "border-white/60" : "border-zinc-700 text-zinc-400 cursor-not-allowed"}`}
                onClick={confirmPower}
              >
                Confirm & Power On
              </button>
            </div>
            {!(battery >= 5 || charger !== "OFF") && (
              <div className="text-[10px] text-yellow-300 mt-2">Insufficient battery. Connect charger (REGEN/DOCK) to enable power-on.</div>
            )}
          </div>
        </div>
      )}

      {/* layout */}
      <div className="grid grid-cols-12 gap-3">
        {/* left */}
        <div className="col-span-12 md:col-span-3 space-y-3">
          <Panel title="Vitals" icon={<Gauge size={16} />}>
            <Bar label="Battery" value={battery}>
              <BatteryFull size={14} />
            </Bar>
            {battery <= CFG.LOW_BATT && powerOn && <div className="mt-2 text-[11px] text-yellow-300">BATTERY LOW — please recharge soon.</div>}
            <Bar label="GN Output" value={reactor}>
              <Zap size={14} />
            </Bar>
            <Bar label="System Heat" value={heat}>
              <FlameKindling size={14} />
            </Bar>
            {heat > CFG.OVERHEAT && <div className="mt-2 text-[11px] text-red-400">OVERHEAT! Reduce load or dock for cooling.</div>}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <Radial label="Throttle" value={Math.min(100, speed / 6.4)} color={transAm ? "red" : "cyan"} />
              <Radial label="Lock" value={lock} color={transAm ? "red" : "cyan"} />
              <Radial label="Altitude" value={clamp(alt / 50, 0, 100)} color={transAm ? "red" : "cyan"} />
            </div>
          </Panel>
          <Panel title="Frame" icon={<Sparkles size={16} />}>
            <FrameGrid frame={frame} />
          </Panel>
          <Panel title="Subsystems (Health)" icon={<Sparkles size={16} />}>
            <SubsysHealth subs={subs} />
          </Panel>
          <Panel title="Subsystem Power" icon={<Sparkles size={16} />}>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(sub).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => powerOn && setSub((p) => ({ ...p, [k]: !v }))}
                  className={`px-2 py-1 rounded border ${v ? "border-emerald-500" : "border-zinc-700 text-zinc-400"} ${!powerOn ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {k.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="text-[10px] opacity-70 mt-1">Weapons OFF blocks Burst & firing. Solar ON prevents battery drain.</div>
          </Panel>
          <Panel title="Sensors Monitor" icon={<RadarIcon size={16} />}>
            <SensorsMonitor enabled={sub.sensors && powerOn} lock={lock} health={subs.sensors} />
          </Panel>
          <Panel title="Nav Monitor" icon={<Compass size={16} />}>
            <NavMonitor enabled={sub.nav && powerOn} speed={speed} alt={alt} heading={yaw} />
          </Panel>
          <Panel title="Weapons Monitor" icon={<FlameKindling size={16} />}>
            <WeaponsMonitor enabled={sub.weapons && powerOn} charge={charge} transAm={transAm} burstCD={burstCD} />
          </Panel>
          <Panel title="Solar Monitor" icon={<Sparkles size={16} />}>
            <SolarMonitor enabled={sub.solar && powerOn} battery={battery} stats={solarStats} />
          </Panel>
        </div>

        {/* center */}
        <div className="col-span-12 md:col-span-6">
          <HUD
            powerOn={powerOn}
            hudOn={hudOn}
            gnFX={gnFX}
            transAm={transAm}
            burstActive={burst}
            charge={charge}
            lock={lock}
            battery={battery}
            charger={charger as ChargerMode}
            pitch={pitch}
            roll={roll}
            speed={speed}
            alt={alt}
            heading={yaw}
            target={target as TargetTrack | null}
            sensorsOnline={sub.sensors}
            onRequestPower={() => setPowerOn(true)}
          />

          <Panel title="Radar" icon={<RadarIcon size={16} />}>
            <Radar
              power={powerOn}
              sensors={sub.sensors}
              lock={lock}
              onTrack={(d) => {
                setTarget(d);
                pushLog("Sensor", `Target track set: (${d.x.toFixed(1)}, ${d.y.toFixed(1)}) ${Math.round(d.distance)} m @ ${Math.round(d.bearing)}°`);
              }}
            />
          </Panel>
          <Panel title="COMMS Log" icon={<Radio size={16} />}>
            <div ref={logRef} className="max-h-64 overflow-auto rounded-md bg-zinc-950/60 border border-zinc-800 p-2 text-xs">
              {log.map((m) => (
                <div key={m.id} className="p-2 rounded-md border border-zinc-800 mb-1 bg-zinc-900/40">
                  <span className="text-white">[{m.ch}]</span> {m.text}
                </div>
              ))}
            </div>
          </Panel>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Info title="Throttle" value={`${Math.round(Math.min(100, speed / 6.4))}%`} />
            <Info title="Battery" value={`${Math.round(battery)}%`} />
            <Info title="GN Output" value={`${Math.round(reactor)}%`} />
          </div>
        </div>

        {/* right */}
        <div className="col-span-12 md:col-span-3 space-y-3">
          <Panel title="Mission Link" icon={<PhoneCall size={16} />}>
            <div className="flex items-center gap-2 text-xs mb-2">
              <button
                className={`px-2 py-1 rounded border ${callOn ? "border-red-500" : "border-white/50"}`}
                onClick={() => setCallOn((v) => !v)}
                disabled={!powerOn || !sub.comms}
              >
                {callOn ? (
                  <span className="inline-flex items-center gap-1">
                    <PhoneOff size={14} />
                    End
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <PhoneCall size={14} />
                    Start
                  </span>
                )}
              </button>
              <button
                className="px-2 py-1 rounded border border-white/30"
                onClick={() => setMode((m) => (m === "VOICE" ? "VIDEO" : "VOICE"))}
                disabled={!powerOn || !sub.comms}
              >
                {mode === "VOICE" ? (
                  <span className="inline-flex items-center gap-1">
                    <Video size={14} />
                    Video
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Mic size={14} />
                    Voice
                  </span>
                )}
              </button>
              <button className="px-2 py-1 rounded border border-white/30" onClick={() => setMuted((m) => !m)} disabled={!powerOn || !sub.comms}>
                {muted ? (
                  <span className="inline-flex items-center gap-1">
                    <VolumeX size={14} />
                    Muted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Volume2 size={14} />
                    Live
                  </span>
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["Lockon", "Sumeragi", "Allelujah", "Tieria"].map((name) => (
                <div key={name} className="relative h-24 rounded-md border border-zinc-700 overflow-hidden bg-zinc-950">
                  {mode === "VIDEO" ? (
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 2px, transparent 2px, transparent 6px)",
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items=end gap-0.5 p-2">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="w-1 bg-emerald-400" style={{ height: `${(sig / 100) * (8 + (i % 5) * 10)}%`, opacity: 0.7 }} />
                      ))}
                    </div>
                  )}
                  <div className="absolute left-2 top-2 text-[10px]">{name}</div>
                </div>
              ))}
            </div>
            <div className="text-[10px] opacity-70 mt-1">
              {!sub.comms ? "Comms power: OFF" : callOn ? `Channel live — ${mode}${muted ? " (muted)" : ""}` : "Channel idle"}
            </div>
          </Panel>
          <Panel title="Controls" icon={<Sparkles size={16} />}>
            <div className="text-xs space-y-3">
              <div>Power: asks pilot name first (Cancel → OFFLINE). Needs battery ≥ 5% or charger.</div>
              <div>
                TRANS-AM: manual only; disabled while charging; needs Weapons ON; batt ≥ {CFG.AUTO_MIN_BATT}% & charge ≥ {CFG.MIN_CHARGE_FOR_MODE}%.
              </div>
              <div>Burst: requires TRANS-AM & charge ≥ {CFG.MIN_CHARGE_FOR_BURST}%, no cooldown active, Weapons ON.</div>
              <div>Charger: OFF / REGEN / DOCK. Solar: prevents battery drain.</div>
            </div>
          </Panel>
          <Panel title="COMMS Monitor" icon={<Radio size={16} />}>
            <CommsMonitor enabled={sub.comms && powerOn} mode={mode} live={callOn} muted={muted} level={sig} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-xs flex items-center justify-between">
      <span>{title}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
