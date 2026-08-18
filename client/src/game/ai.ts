import type { Difficulty, TurnRecord } from "@/game/types";

function pick(values: number[]) {
  return values[Math.floor(Math.random() * values.length)] ?? 1;
}

/** Uses prior committed turns only—never the human's current selection. */
export function generateAiChoice(history: TurnRecord[], range: 6 | 10, difficulty: Difficulty) {
  const values = Array.from({ length: range }, (_, index) => index + 1);
  if (difficulty === "easy" || history.length === 0) return pick(values);
  const past = history.slice(-6).map((turn) => turn.playerChoice).filter(Boolean);
  const score = past.reduce<Record<number, number>>((memo, choice) => ({ ...memo, [choice]: (memo[choice] ?? 0) + 1 }), {});
  const predicted = values.reduce((best, value) => (score[value] ?? 0) > (score[best] ?? 0) ? value : best);
  if (difficulty === "hard") return Math.random() < 0.68 ? predicted : pick(values);
  return Math.random() < 0.42 ? predicted : pick(values.filter((value) => value !== past.at(-1)));
}

