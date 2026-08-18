import { generateAiChoice } from "@/game/ai";
import { getBaseballTurn, getCricketTurn } from "@/game/rules";
import type { MatchConfig, MatchState, PlayerKey, TurnOutcome } from "@/game/types";

export class MatchEngine {
  private state: MatchState;
  private localChoices: Partial<Record<PlayerKey, number>> = {};

  constructor(config: MatchConfig) {
    this.state = { config, innings: 1, batting: "player", target: null, scores: { player: 0, opponent: 0 }, strikes: 0, baseballTarget: config.range === 6 ? 24 : 36, history: [] };
  }

  snapshot() { return structuredClone(this.state); }

  submitVsAi(playerChoice: number) {
    return this.resolve(playerChoice, generateAiChoice(this.state.history, this.state.config.range, this.state.config.difficulty));
  }

  submitLocal(actor: PlayerKey, choice: number) {
    this.localChoices[actor] = choice;
    if (this.localChoices.player === undefined || this.localChoices.opponent === undefined) return null;
    const outcome = this.resolve(this.localChoices.player, this.localChoices.opponent);
    this.localChoices = {};
    return outcome;
  }

  continueCricketInnings() {
    if (this.state.innings === 1 && this.state.config.game === "cricket") {
      this.state.innings = 2;
      this.state.batting = "opponent";
      this.state.target = this.state.scores.player + 1;
    }
    return this.snapshot();
  }

  private resolve(playerChoice: number, opponentChoice: number): TurnOutcome {
    return this.state.config.game === "cricket" ? this.resolveCricket(playerChoice, opponentChoice) : this.resolveBaseball(playerChoice, opponentChoice);
  }

  private resolveCricket(playerChoice: number, opponentChoice: number): TurnOutcome {
    const play = getCricketTurn(playerChoice, opponentChoice, this.state.batting);
    let winner: PlayerKey | undefined;
    let inningsEnded = false;
    if (play.event === "out") {
      inningsEnded = true;
      if (this.state.innings === 2) { winner = this.state.batting === "player" ? "opponent" : "player"; this.state.winner = winner; }
    } else {
      this.state.scores[this.state.batting] += play.scoreDelta;
      if (this.state.innings === 2 && this.state.target !== null && this.state.scores[this.state.batting] >= this.state.target) { winner = this.state.batting; this.state.winner = winner; }
    }
    const record = { playerChoice, opponentChoice, scoringPlayer: this.state.batting, event: play.event, scoreDelta: play.scoreDelta };
    this.state.history.push(record);
    return { ...record, message: winner && play.event !== "out" ? "TARGET REACHED!" : play.message, strikes: this.state.strikes, inningsEnded, winner };
  }

  private resolveBaseball(playerChoice: number, opponentChoice: number): TurnOutcome {
    const play = getBaseballTurn(playerChoice, opponentChoice);
    let winner: PlayerKey | undefined;
    if (play.event === "strike") { this.state.strikes += 1; if (this.state.strikes >= 3) { winner = "opponent"; this.state.winner = winner; } }
    else { this.state.scores.player += play.scoreDelta; if (this.state.scores.player >= this.state.baseballTarget) { winner = "player"; this.state.winner = winner; } }
    const record = { playerChoice, opponentChoice, scoringPlayer: "player" as PlayerKey, event: winner === "player" ? "target" as const : play.event, scoreDelta: play.scoreDelta };
    this.state.history.push(record);
    return { ...record, message: winner === "player" ? "HOME RUN TARGET!" : winner === "opponent" ? "STRIKE 3 — YOU'RE OUT!" : play.message, strikes: this.state.strikes, inningsEnded: false, winner };
  }
}

