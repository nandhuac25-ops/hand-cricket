# HAND PLAY — Architecture

## System Boundary

The project uses React as the full-screen frame, a small Babylon scene for the layered game-arena atmosphere, and framework-independent TypeScript for match state and game rules. React components render the inputs and visual state supplied by the engine; they do not calculate scoring rules inline.

## Source Layout

| Path | Responsibility |
| --- | --- |
| `client/src/components/GameCanvas.tsx` | The only routed game surface; owns the lifecycle-safe Babylon canvas and the React accessibility/UI overlay. |
| `client/src/game/scene.ts` | Creates and disposes the minimalist Babylon stadium ambience with resize-safe scene ownership. |
| `client/src/game/types.ts` | Shared game modes, turn phases, choices, scores, player labels, results, and settings types. |
| `client/src/game/rules.ts` | Pure cricket and baseball scoring, strike, target, innings, and result functions. |
| `client/src/game/ai.ts` | Difficulty-aware, choice-blind AI selector using previous committed turns only. |
| `client/src/game/MatchEngine.ts` | Mode-specific match state machine and immutable committed-turn orchestration. |
| `client/src/game/online.ts` | Replaceable `MatchmakingGateway` interface plus the mock gateway used in the static release. |
| `client/src/game/demo.ts` | Deterministic autoplay choices enabled only with `?demo`. |
| `client/src/components/HandIllustration.tsx` | Reusable illustrated gesture hand and numeric badge, animated from props without rule ownership. |
| `client/src/index.css` | Floodlight Folklore tokens, typography, responsive arena geometry, and motion rules. |
| `client/src/App.tsx` | App boundary that renders only `GameCanvas`. |

## Match States

| State | Entry condition | Allowed action | Exit condition |
| --- | --- | --- | --- |
| `dashboard` | New/restarted session | Choose game or open profile/history/settings | Game selection |
| `range` | Game chosen | Choose 6 or 10 range | Range confirmed |
| `mode` | Range chosen | Choose AI, local, or online | Mode confirmed |
| `difficulty` | AI mode chosen | Choose difficulty | Difficulty confirmed |
| `matchmaking` | Online selected | Wait or cancel | Mock opponent found / cancel |
| `localCommit` | Local mode chosen | Current player secretly chooses | Other player turn / countdown |
| `countdown` | Both local choices committed | Observe reveal count | Reveal begins |
| `turnIdle` | Match ready | Commit a number | Choice commitment |
| `revealing` | Both choices committed | Observe reveal | Resolver returns a turn outcome |
| `inningsBreak` | Cricket batter out | Continue | Next innings begins |
| `result` | Match over | Replay, change options, return home | Requested destination |

## Game Data Model

The engine records a `MatchConfig` (game, range, mode, difficulty), a `MatchState` (phase, inning, batting player, scores, strikes, history), and a `TurnOutcome` (choices, event, score delta, target status). This makes online transport and future camera-derived numbers interchangeable: each adaptor supplies a committed `Choice`, while `MatchEngine` applies exactly the same resolver.

## Asset Hints

| Asset | Runtime use | Size | Source URL |
| --- | --- | --- | --- |
| Night-pitch texture | Layered CSS radial floodlight pools, paper grain, pitch lines, and chalk creases. | Fullscreen responsive | Runtime CSS; no network dependency. |
| Hand-and-ball crest | Geometric three-finger mark used in the mast, profile card, and favicon. | 46–94 px | Runtime CSS / inline favicon SVG. |
| Match cards | Cricket/baseball selection card graphics using tape marks, scoreboard circles, and oversized game initials. | Responsive card art | Runtime CSS; no network dependency. |
