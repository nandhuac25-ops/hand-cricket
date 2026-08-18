# Assets

**Art direction:** Contemporary sports-broadcast design informed by Indian street-cricket nostalgia: a deep night-pitch blue-black arena, concentrated warm floodlights, tactile paper grain, confident inked hand illustrations, clean athletic type, and Signal Lime #C8F447 for decisive actions. No cyberpunk glow, purple gradients, generic dashboard grids, or repeated placeholder imagery.

## Backgrounds

| Name | Description | Size | Image |
| --- | --- | --- | --- |
| `hand-play-visual-target` | Reference screenshot showing the intended arena hierarchy and hand-to-hand reveal moment. | 1920×1080, reference only | `/manus-storage/hand-play-visual-target_40929844.png` |
| `hand-play-arena-texture` | Low-contrast midnight ground with restrained floodlight bloom and clear centre play space. | 1920×1080, fullscreen cover | `/manus-storage/hand-play-arena-texture_b7158449.png` |

## Sprites / UI Art

| Name | Description | Size | Image |
| --- | --- | --- | --- |
| `hand-play-crest` | Circular three-finger hand-and-ball brand crest on transparent background. | 88×88 px | `/manus-storage/hand-play-crest_2116b604.png` |
| `hand-play-cricket-art` | Single expressive hand and cricket ball for the cricket choice card. | 360×450 px | `/manus-storage/hand-play-cricket-art_ec73f14f.png` |
| `hand-play-baseball-art` | Single expressive hand and baseball graphic for the baseball choice card. | 360×450 px | `/manus-storage/hand-play-baseball-art_156c0cf9.png` |

## Procedural Elements

| Element | Description | Size | Implementation |
| --- | --- | --- | --- |
| Gesture hands | Two high-contrast selectable hand silhouettes with pose number and wrist accents. | 260–390 px by breakpoint | Semantic React/SVG shapes plus CSS motion; number badge controls the pose. |
| Number tray | Tactile bottom interaction buttons with selected/disabled states. | 56–84 px per tile | HTML controls to remain touch- and keyboard-accessible. |
| Score slates | Leaning broadcast score panels, innings chips, and strike dots. | Responsive | CSS shapes and type for clarity at any scale. |

## Runtime Asset Decision

The initial generated reference and supporting images were reserved as visual direction, but the returned game-card and arena images resolved to unavailable placeholders in preview. The shipped interface therefore uses resilient CSS-built paper grain, floodlight pools, taped-ball marks, chalk creases, hand silhouettes, score slates, and the hand-and-ball crest. This preserves the selected visual direction without a runtime dependency on unavailable images.
