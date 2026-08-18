# Game Plan: HAND PLAY

## Risk Tasks

### 1. Gesture reveal choreography
- **Why isolated:** The product’s primary promise is a synchronous hand-to-centre reveal. If hand state, numeric badges, and result timing drift, the experience feels like an ordinary form instead of a match.
- **Approach:** Keep each turn in an explicit state machine (`idle → committed → revealing → resolved → next`) and drive only transform/opacity animations. Both selections are committed before the reveal timer begins; the result remains hidden until the two hands are visibly in their reveal position.
- **Verify:** A player number click disables further input, both hands move from their idle sides toward the centre together, values resolve after the movement, the result appears after both values, and the hands return to idle before the next turn. Reduced-motion settings preserve the same state order without translating hands.

### 2. Fair simultaneous choice across AI and local play
- **Why isolated:** AI must not access the player’s current number before commitment, and two-player mode must prevent copying. These rules are easy to undermine if number choice is embedded in the rendered UI.
- **Approach:** Store submitted moves independently in the game engine. Generate AI choice only after the player commits. In local mode, move from Player 1 private entry to Player 2 private entry, then run a visible `3 → 2 → 1 → REVEAL` phase before both values reach the resolver.
- **Verify:** In AI play, an opponent value is absent from the UI until the player has committed. In local play, Player 1’s submitted number is never visible while Player 2 chooses. Both modes resolve a single result from two immutable choices.

### 3. Cricket innings and baseball strike rule boundaries
- **Why isolated:** Cricket ends on exact matches and switches innings, whereas baseball receives strikes only on specific unordered adjacent pairs. The two rulesets must not leak into each other.
- **Approach:** Define pure, independently testable rule functions for cricket turns, innings/target checks, baseball strike detection, AI selection, and game-end detection. The UI consumes result records only.
- **Verify:** Cricket awards the batting side’s selected value on unequal choices, declares OUT on equal values, declares a target win immediately when the second innings exceeds the first score, and handles a zero-value duck. Baseball recognises 2+3, 4+5, and 6+1 in either order, increments strikes once per turn, and ends only after the third strike.

### 4. Mock online handoff
- **Why isolated:** The initial static frontend cannot provide actual global matchmaking, but online selection must remain a credible game journey rather than a dead-end screen.
- **Approach:** Implement a time-bounded mock matchmaking adapter with `searching`, `found`, and `ready` states. Encapsulate it behind an interface that a future websocket or Supabase client can replace without changing match rules.
- **Verify:** Selecting Online opens a status screen, transitions through searching to a named mock opponent, offers a clear cancel action, and then enters a valid game arena after Ready.

## Main Build

Build a full-screen, responsive arena for the start dashboard, game/range/mode selection, AI difficulty selection, mock online waiting state, game play, result actions, settings, profile, and local history. The first playable release prioritises cricket and baseball rules, 6/10 range, AI play, same-device 2-player privacy, a non-networked online simulation, sound/motion settings, and browser-local session history. A future real-time service is represented by a thin matchmaking boundary rather than mock network calls.

- **Assets:**
  - Floodlight arena backdrop (`hand-play-arena-texture`) — fullscreen, 1920×1080 visual role.
  - Hand-and-ball crest (`hand-play-crest`) — 88×88 px header mark / favicon role.
  - Cricket selection art (`hand-play-cricket-art`) — 360×450 px card role.
  - Baseball selection art (`hand-play-baseball-art`) — 360×450 px card role.
  - Visual target (`hand-play-visual-target`) — 1920×1080 reference role.
- **Verify:**
  - Setup moves through game → range → mode without dead ends and every screen has a back route.
  - The match arena remains the largest visual element on mobile and desktop; touch targets stay large.
  - Number input, hand reveal, score update, innings / strikes, and game result use the declared state machine.
  - Recent results and profile values update during the active browser session.
  - No missing image URLs, placeholder visuals, clipped text, or console errors during a playable session.
  - Reference consistency: night-pitch palette, warm floodlight contrast, slanted score slates, illustrated gesture focus, Signal Lime actions.
  - A deterministic `?demo` mode plays visible turns for screenshot verification.

