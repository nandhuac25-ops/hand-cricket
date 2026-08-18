export interface OnlineMatchParticipant { id: string; displayName: string; presence: "online" | "connecting"; }
export interface MatchmakingGateway { findOpponent(): Promise<OnlineMatchParticipant>; cancelSearch(): Promise<void>; }
export const mockOpponent: OnlineMatchParticipant = { id: "mock-mira-01", displayName: "MIRA", presence: "online" };

