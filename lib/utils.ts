export const clamp = (n: number, a = 0, b = 100) => Math.max(a, Math.min(b, n));
export const rnd = (a: number, b: number) => Math.random() * (b - a) + a;
export const uid = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

// 0° = North (up). Return -180..180 relative to current heading
export const relBearing = (bearing: number, yaw: number) => ((bearing - yaw + 540) % 360) - 180;
