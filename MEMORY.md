# HAND PLAY — Production Memory

## Decisions

- The selected design is **Floodlight Folklore**. Signal Lime #C8F447 is the action colour; it is never used as a generic background fill.
- The current release is frontend-only. Online play is an intentionally transparent mock matchmaking experience with a future `MatchmakingGateway` boundary, not a claim of real global matchmaking.
- Gameplay rules must be deterministic and separate from UI. AI choices are produced only after the human move has been committed and do not inspect it.
- The visual target and four supporting assets are generated in the webdev asset store; reference their supplied `/manus-storage/...` URLs directly.
- Generated art may still be processing when code is written. URLs are stable and may be used immediately.

## Final Visual Implementation

- Preview validation showed unavailable generated-image placeholders for the reserved card and arena imagery. Those URLs were removed from the runtime experience before delivery.
- The final visual system is intentionally self-contained: CSS creates the tactile night-pitch texture, paper grain, chalk crease, taped-ball marks, match-ticket controls, scorecard panels, and the three-finger hand-and-ball crest.
- Desktop, deterministic arena, and mobile arena previews were visually checked after the resilience change. Type checking and production build both completed successfully; the build emits a non-blocking bundle-size warning from the Babylon runtime.

## Requirements Captured

- Cricket uses same-number out, batting-player run score on unmatched choices, 0-run duck, innings change, and target chase.
- Baseball uses unordered 2+3, 4+5, 6+1 strike pairs and a third-strike out.
- The game supports 6- and 10-number ranges, AI difficulty choices, same-device protected turn entry, sound/motion settings, a simple profile/history view, and a `?demo` playable verification route.

## Implementation Notes

- The animated arena should preserve the hand choreography even with reduced motion by removing translation but keeping reveal state/timing visible.
- Use browser storage only for optional session-local history/settings. Do not request account or personal data in the static release.
- Add no test reviews, ratings, or testimonials anywhere in the product.
