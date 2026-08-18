import type { PlayerKey, TurnEvent } from "@/game/types";

export const BASEBALL_STRIKE_PAIRS = [[2, 3], [4, 5], [6, 1]] as const;

export function getAvailableNumbers(game: "cricket" | "baseball", range: 6 | 10) {
  const values = Array.from({ length: range }, (_, index) => index + 1);
  return game === "cricket" ? [0, ...values] : values;
}

export function getCricketTurn(playerChoice: number, opponentChoice: number, batting: PlayerKey) {
  if (playerChoice === opponentChoice) return { event: "out" as TurnEvent, scoreDelta: 0, message: "OUT! SAME NUMBER." };
  const run = batting === "player" ? playerChoice : opponentChoice;
  if (run === 0) return { event: "duck" as TurnEvent, scoreDelta: 0, message: "DUCK — 0 RUNS" };
  return { event: "run" as TurnEvent, scoreDelta: run, message: `+${run} RUN${run === 1 ? "" : "S"}` };
}

export function getBaseballTurn(playerChoice: number, opponentChoice: number) {
  const strike = BASEBALL_STRIKE_PAIRS.findIndex(
    ([left, right]) => (playerChoice === left && opponentChoice === right) || (playerChoice === right && opponentChoice === left),
  );
  if (strike >= 0) return { event: "strike" as TurnEvent, scoreDelta: 0, message: `STRIKE ${strike + 1}!` };
  return { event: "score" as TurnEvent, scoreDelta: playerChoice, message: `+${playerChoice} SCORE` };
}

