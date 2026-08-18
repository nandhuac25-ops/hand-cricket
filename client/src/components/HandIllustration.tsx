// Floodlight Folklore component reminder: gestures should feel tactile and readable;
// Signal Lime is reserved for active reveals and never used as generic decoration.
import { motion } from "framer-motion";

interface HandIllustrationProps {
  side: "opponent" | "player";
  value?: number;
  label: string;
  active: boolean;
  reducedMotion: boolean;
}

export function HandIllustration({ side, value, label, active, reducedMotion }: HandIllustrationProps) {
  const visibleFingers = Math.min(Math.max(value ?? 0, 0), 5);
  const revealed = value !== undefined;
  return (
    <motion.div
      className={`gesture-hand gesture-hand--${side}`}
      initial={false}
      animate={active && !reducedMotion ? { x: side === "opponent" ? 34 : -34, y: side === "opponent" ? 14 : -14, rotate: side === "opponent" ? 2 : -2 } : { x: 0, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 255, damping: 23, mass: 0.72 }}
    >
      <span className="hand-name">{label}</span>
      <div className="hand-art-wrap" aria-hidden="true">
        <svg className="hand-art" viewBox="0 0 180 210">
          <path className="hand-palm" d="M45 92c-4-22 12-35 27-28l6 4V42c0-15 22-15 22 0v24V25c0-15 22-15 22 0v42V35c0-15 22-15 22 0v43l5-15c5-14 25-7 20 8l-11 38c-6 21-20 36-42 43v26H62v-34c-11-12-15-31-17-52Z" />
          {[0, 1, 2, 3, 4].map((finger) => <rect key={finger} className={`hand-finger ${finger < visibleFingers ? "is-up" : "is-folded"}`} x={66 + finger * 16} y={finger === 0 ? 62 : 31 - Math.min(finger, 2) * 4} width="13" height={finger === 0 ? "46" : "68"} rx="6.5" />)}
          <path className="hand-crease" d="M75 117c18 7 38 7 58-1M81 137c16 7 32 7 48 0" />
        </svg>
        <span className="hand-wrist-band" />
      </div>
      <span className={`hand-number ${revealed ? "is-revealed" : ""}`}>{revealed ? value : "?"}</span>
    </motion.div>
  );
}

