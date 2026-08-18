export type GameKind = "cricket" | "baseball";
export type PlayMode = "ai" | "local" | "online";
export type Difficulty = "easy" | "medium" | "hard";
export type PlayerKey = "player" | "opponent";
export type TurnEvent = "run" | "duck" | "out" | "strike" | "score" | "target";

export interface MatchConfig {
  game: GameKind;
  range: 6 | 10;
  mode: PlayMode;
  difficulty: Difficulty;
}

export interface TurnRecord {
  playerChoice: number;
  opponentChoice: number;
  scoringPlayer: PlayerKey;
  event: TurnEvent;
  scoreDelta: number;
}

export interface TurnOutcome extends TurnRecord {
  message: string;
  strikes: number;
  inningsEnded: boolean;
  winner?: PlayerKey;
}

export interface MatchState {
  config: MatchConfig;
  innings: 1 | 2;
  batting: PlayerKey;
  target: number | null;
  scores: Record<PlayerKey, number>;
  strikes: number;
  baseballTarget: number;
  history: TurnRecord[];
  winner?: PlayerKey;
}

export interface GameSettings {
  sound: boolean;
  music: boolean;
  vibration: boolean;
  reducedMotion: boolean;
}

export interface HistoryEntry {
  id: string;
  game: GameKind;
  winner: PlayerKey;
  scoreText: string;
  createdAt: string;
}

export const DEFAULT_CONFIG: MatchConfig = {
  game: "cricket",
  range: 6,
  mode: "ai",
  difficulty: "medium",
};

export const DEFAULT_SETTINGS: GameSettings = {
  sound: true,
  music: false,
  vibration: true,
  reducedMotion: false,
};

