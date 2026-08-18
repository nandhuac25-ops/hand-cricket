// Floodlight Folklore component reminder: treat the arena as a night-match poster.
// The hands and score slates are the focus; utility controls stay quiet at the edge.
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, CircleDotDashed, Gamepad2, History, Radar, Settings2, Sparkles, Trophy, UserRound, Volume2, VolumeX, Wifi, X } from "lucide-react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HandIllustration } from "@/components/HandIllustration";
import { DEMO_CHOICES } from "@/game/demo";
import { MatchEngine } from "@/game/MatchEngine";
import { mockOpponent } from "@/game/online";
import { getAvailableNumbers } from "@/game/rules";
import { createGameScene, type GameHandle } from "@/game/scene";
import { DEFAULT_CONFIG, DEFAULT_SETTINGS, type Difficulty, type GameKind, type GameSettings, type HistoryEntry, type MatchConfig, type MatchState, type PlayMode, type PlayerKey, type TurnOutcome } from "@/game/types";

type Screen = "home" | "range" | "mode" | "difficulty" | "matchmaking" | "arena" | "innings" | "result";
type Panel = "settings" | "profile" | "history" | null;
type ArenaStage = "idle" | "privacy" | "countdown" | "revealing" | "resolved";

const ASSET = {
};

function labels(mode: PlayMode): Record<PlayerKey, string> {
  if (mode === "local") return { player: "PLAYER 1", opponent: "PLAYER 2" };
  if (mode === "online") return { player: "PLAYER", opponent: mockOpponent.displayName };
  return { player: "PLAYER", opponent: "NIGHT OWL AI" };
}

function ChoiceCard({ title, eyebrow, copy, accent, onClick }: { title: string; eyebrow: string; copy: string; accent: "lime" | "tangerine"; onClick: () => void }) {
  return <motion.button className={`game-choice game-choice--${accent}`} onClick={onClick} whileHover={{ y: -7, rotate: accent === "lime" ? -0.6 : 0.6 }} whileTap={{ scale: 0.98 }}>
    <span className="card-graphic" aria-hidden="true"><i>{accent === "lime" ? "C" : "B"}</i><b /><b /><b /></span><span className="choice-overlay" /><span className="choice-topline">{eyebrow}</span><strong className="choice-title">{title}</strong><span className="choice-copy">{copy}</span><span className="choice-action">ENTER THE MATCH <ChevronRight size={18} /></span>
  </motion.button>;
}

function SetupOption({ index, icon, title, copy, onClick }: { index: string; icon: React.ReactNode; title: string; copy: string; onClick: () => void }) {
  return <motion.button className="setup-option" onClick={onClick} whileHover={{ x: 5 }} whileTap={{ scale: 0.985 }}><span className="setup-index">{index}</span><span className="setup-icon">{icon}</span><span className="setup-body"><strong className="setup-title">{title}</strong><span className="setup-copy">{copy}</span></span><ChevronRight className="setup-arrow" size={22} /></motion.button>;
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const matchEngineRef = useRef<MatchEngine | null>(null);
  const timerRef = useRef<number[]>([]);
  const recordedRef = useRef(false);
  const demoRef = useRef(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [config, setConfig] = useState<MatchConfig>(DEFAULT_CONFIG);
  const [match, setMatch] = useState<MatchState | null>(null);
  const [lastTurn, setLastTurn] = useState<TurnOutcome | null>(null);
  const [arenaStage, setArenaStage] = useState<ArenaStage>("idle");
  const [localActor, setLocalActor] = useState<PlayerKey>("player");
  const [countdown, setCountdown] = useState(3);
  const [found, setFound] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const demo = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo");

  const clearTimers = () => { timerRef.current.forEach((id) => window.clearTimeout(id)); timerRef.current = []; };
  const later = (callback: () => void, ms: number) => { const id = window.setTimeout(callback, ms); timerRef.current.push(id); };
  const names = labels(config.mode);
  const profile = useMemo(() => {
    const wins = history.filter((item) => item.winner === "player").length;
    return { played: history.length, wins, losses: history.length - wins, rate: history.length ? Math.round((wins / history.length) * 100) : 0 };
  }, [history]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    let handle: GameHandle | null = null;
    createGameScene(engine, canvas).then((next) => { handle = next; engine.runRenderLoop(() => next.scene.render()); });
    const resize = () => engine.resize();
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); clearTimers(); handle?.dispose(); engine.dispose(); startedRef.current = false; };
  }, []);

  const buzz = () => { if (settings.vibration && "vibrate" in navigator) navigator.vibrate?.(12); };
  const tap = () => { buzz(); };

  function launch(next: MatchConfig) {
    clearTimers(); recordedRef.current = false; matchEngineRef.current = new MatchEngine(next);
    setConfig(next); setMatch(matchEngineRef.current.snapshot()); setLastTurn(null); setArenaStage("idle"); setLocalActor("player"); setPanel(null); setScreen("arena");
  }
  function chooseGame(game: GameKind) { tap(); setConfig((value) => ({ ...value, game })); setScreen("range"); }
  function chooseRange(range: 6 | 10) { tap(); setConfig((value) => ({ ...value, range })); setScreen("mode"); }
  function chooseMode(mode: PlayMode) {
    tap(); const next = { ...config, mode }; setConfig(next);
    if (mode === "ai") setScreen("difficulty");
    else if (mode === "online") { setFound(false); setScreen("matchmaking"); later(() => setFound(true), 1250); }
    else launch(next);
  }
  function chooseDifficulty(difficulty: Difficulty) { launch({ ...config, mode: "ai", difficulty }); }
  function goHome() { clearTimers(); setScreen("home"); setMatch(null); setLastTurn(null); setArenaStage("idle"); setPanel(null); }

  function finishTurn(outcome: TurnOutcome) {
    setMatch(matchEngineRef.current?.snapshot() ?? null); setLastTurn(outcome); setArenaStage("revealing");
    later(() => setArenaStage("resolved"), 920);
    later(() => {
      if (outcome.inningsEnded && !outcome.winner) setScreen("innings");
      else if (outcome.winner) setScreen("result");
      else { setLastTurn(null); setArenaStage("idle"); setLocalActor("player"); }
    }, 1700);
  }
  function commit(value: number) {
    if (!matchEngineRef.current || !match) return;
    if (!(arenaStage === "idle" || (config.mode === "local" && arenaStage === "privacy"))) return;
    tap();
    if (config.mode !== "local") { finishTurn(matchEngineRef.current.submitVsAi(value)); return; }
    const outcome = matchEngineRef.current.submitLocal(localActor, value);
    if (!outcome) { setLocalActor("opponent"); setArenaStage("privacy"); return; }
    setMatch(matchEngineRef.current.snapshot()); setLastTurn(outcome); setArenaStage("countdown"); setCountdown(3);
    later(() => setCountdown(2), 520); later(() => setCountdown(1), 1040); later(() => { setCountdown(0); setArenaStage("revealing"); }, 1560); later(() => setArenaStage("resolved"), 2460);
    later(() => { if (outcome.inningsEnded && !outcome.winner) setScreen("innings"); else if (outcome.winner) setScreen("result"); else { setLastTurn(null); setArenaStage("idle"); setLocalActor("player"); } }, 3220);
  }
  function continueInnings() { const next = matchEngineRef.current?.continueCricketInnings(); if (next) setMatch(next); setLastTurn(null); setArenaStage("idle"); setScreen("arena"); }

  useEffect(() => {
    if (screen !== "result" || !match?.winner || recordedRef.current) return;
    recordedRef.current = true;
    const scoreText = match.config.game === "cricket" ? `${match.scores.player} — ${match.scores.opponent}` : `${match.scores.player} / ${match.baseballTarget}`;
    setHistory((items) => [{ id: `${Date.now()}`, game: match.config.game, winner: match.winner!, scoreText, createdAt: new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date()) }, ...items].slice(0, 8));
  }, [screen, match?.winner]);
  useEffect(() => { if (!demo || demoRef.current) return; demoRef.current = true; const id = window.setTimeout(() => launch(DEFAULT_CONFIG), 260); return () => window.clearTimeout(id); }, [demo]);
  useEffect(() => { if (!demo || screen !== "arena" || arenaStage !== "idle" || !match || match.history.length > 0) return; const choice = Math.min(DEMO_CHOICES[0] ?? 1, config.range); const id = window.setTimeout(() => commit(choice), 6500); return () => window.clearTimeout(id); }, [demo, screen, arenaStage, match?.history.length]);

  const back = (target: Screen) => <button className="quiet-button" onClick={() => setScreen(target)}><ArrowLeft size={17} /> BACK</button>;
  const screenView = () => {
    if (screen === "home") return <motion.section className="home-screen" key="home" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><div className="home-copy"><span className="eyebrow"><span className="pulse-dot" /> LIVE FROM THE NIGHT PITCH</span><h1>MAKE YOUR MOVE.<br /><em>OWN THE MATCH.</em></h1><p>Bring childhood hand games back to life — one bold number, one held breath, one decisive reveal at a time.</p><div className="home-notes"><span><Sparkles size={16} /> animated hand reveals</span><span><Wifi size={16} /> local & online-ready play</span></div></div><div className="home-games"><ChoiceCard title="HAND CRICKET" eyebrow="THE CLASSIC" copy="Match numbers. Score your runs. Chase the target under the lights." accent="lime" onClick={() => chooseGame("cricket")} /><ChoiceCard title="HAND BASEBALL" eyebrow="THE TWIST" copy="Stay clear of adjacent strikes and race your score to the finish." accent="tangerine" onClick={() => chooseGame("baseball")} /></div><div className="home-footer"><span>CHOOSE A MATCH TYPE TO BEGIN</span><span>TOUCH • TAP • PLAY</span></div></motion.section>;
    if (screen === "range") return <motion.section className="setup-screen" key="range" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>{back("home")}<div className="setup-head"><span className="eyebrow">MATCH SETUP · 01 / 03</span><h2>SELECT YOUR<br /><em>PLAYING RANGE.</em></h2><p>“Fingers” means your available number range — choose the pace of the match.</p></div><div className="setup-rail"><SetupOption index="01" icon={<span className="range-mark">1–6</span>} title="6 FINGERS" copy="Fast, familiar play with numbers 1 through 6. Cricket also includes a 0-run duck." onClick={() => chooseRange(6)} /><SetupOption index="02" icon={<span className="range-mark">1–10</span>} title="10 FINGERS" copy="A wider range for longer reads, bigger scores, and more surprise." onClick={() => chooseRange(10)} /></div></motion.section>;
    if (screen === "mode") return <motion.section className="setup-screen" key="mode" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>{back("range")}<div className="setup-head"><span className="eyebrow">MATCH SETUP · 02 / 03</span><h2>CHOOSE HOW<br /><em>YOU PLAY.</em></h2><p>Every mode keeps the same moment of truth: commit, reveal, and live with the result.</p></div><div className="setup-rail setup-rail--modes"><SetupOption index="A" icon={<Radar size={27} />} title="1 VS AI" copy="A choice-blind opponent with three levels of pattern awareness." onClick={() => chooseMode("ai")} /><SetupOption index="B" icon={<Gamepad2 size={27} />} title="2 PLAYER" copy="Pass the device. Each selection stays secret until the countdown ends." onClick={() => chooseMode("local")} /><SetupOption index="C" icon={<Wifi size={27} />} title="ONLINE" copy="A connection-ready mock lobby for future live matchmaking." onClick={() => chooseMode("online")} /></div></motion.section>;
    if (screen === "difficulty") return <motion.section className="setup-screen" key="difficulty" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>{back("mode")}<div className="setup-head"><span className="eyebrow">MATCH SETUP · 03 / 03</span><h2>SET THE<br /><em>PRESSURE.</em></h2><p>The AI reads the record, never your current hand.</p></div><div className="difficulty-row">{([['easy','EASY','Mostly random. A clean warm-up.'],['medium','MEDIUM','Reads prior turns, not your hand.'],['hard','HARD','Tests your habits under pressure.']] as const).map(([value, title, copy], index) => <motion.button key={value} className={`difficulty-card difficulty-card--${value}`} onClick={() => chooseDifficulty(value)} whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}><span>0{index + 1}</span><strong>{title}</strong><p>{copy}</p><ChevronRight size={22} /></motion.button>)}</div></motion.section>;
    if (screen === "matchmaking") return <motion.section className="matchmaking-screen" key="matchmaking" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>{back("mode")}<div className="matchmaking-card"><span className="eyebrow"><span className="pulse-dot" /> ONLINE MATCHMAKING</span><div className="radar-shell"><CircleDotDashed size={72} /><span className="radar-sweep" /></div>{found ? <><h2>MATCH<br /><em>FOUND.</em></h2><p><strong>{mockOpponent.displayName}</strong> is online and ready for a hand-to-hand showdown.</p></> : <><h2>SCANNING THE<br /><em>PLAYING FIELD.</em></h2><p>Looking for an opponent with a live connection.</p></>}<div className="opponent-strip"><span className="avatar-dot">M</span><span><strong>{found ? mockOpponent.displayName : "SEARCHING…"}</strong><small>{found ? "connected · ready" : "finding a seat"}</small></span><span className={found ? "presence found" : "presence"} /></div>{found ? <button className="primary-button" onClick={() => launch({ ...config, mode: "online" })}>PLAY {mockOpponent.displayName} <ChevronRight size={18} /></button> : <button className="quiet-button quiet-button--centre" onClick={() => setScreen("mode")}>CANCEL SEARCH</button>}</div></motion.section>;
    if (screen === "innings" && match) { const target = match.scores.player + 1; return <motion.section className="innings-screen" key="innings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}><span className="eyebrow">SCORECARD UPDATE</span><h2>INNINGS<br /><em>OVER.</em></h2><p>{names.player} set <strong>{match.scores.player}</strong>. {names.opponent} needs <strong>{target}</strong> to take the match.</p><div className="target-board"><span>TARGET</span><strong>{target}</strong><small>RUNS TO WIN</small></div><button className="primary-button" onClick={continueInnings}>START THE CHASE <ChevronRight size={18} /></button></motion.section>; }
    if (screen === "result" && match) { const won = match.winner === "player"; const final = match.config.game === "cricket" ? `${match.scores.player} — ${match.scores.opponent}` : `${match.scores.player} / ${match.baseballTarget}`; return <motion.section className={`result-screen ${won ? "is-win" : "is-loss"}`} key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><span className="eyebrow">FINAL WHISTLE</span><Trophy className="result-trophy" size={68} /><h2>{won ? <>PLAYER<br /><em>WINS.</em></> : <>BETTER LUCK<br /><em>NEXT TIME.</em></>}</h2><p>{match.config.game === "cricket" ? "The chase is over. The score tells the story." : won ? "You beat the strike count and reached the target." : "Three linked strikes ended this at-bat."}</p><div className="final-score"><span>FINAL SCORE</span><strong>{final}</strong></div><div className="result-actions"><button className="primary-button" onClick={() => launch(config)}>PLAY AGAIN <ChevronRight size={18} /></button><button className="secondary-button" onClick={() => setScreen("mode")}>CHANGE MODE</button><button className="secondary-button" onClick={() => setScreen("range")}>CHANGE RANGE</button><button className="secondary-button" onClick={goHome}>MAIN MENU</button></div></motion.section>; }
    if (screen === "arena" && match) {
      const reveal = arenaStage === "revealing" || arenaStage === "resolved";
      const canChoose = arenaStage === "idle" || (config.mode === "local" && arenaStage === "privacy");
      const prompt = config.mode === "local" ? (arenaStage === "privacy" ? "PASS THE DEVICE — PLAYER 2, MAKE YOUR PRIVATE MOVE." : "PLAYER 1, MAKE YOUR PRIVATE MOVE.") : config.game === "baseball" ? `BUILD TO ${match.baseballTarget}. AVOID THE LINKED STRIKES.` : match.batting === "player" ? "YOU'RE BATTING. PICK YOUR RUNS." : `${names.opponent} IS BATTING. BOWL A NUMBER.`;
      const numbers = getAvailableNumbers(config.game, config.range);
      return <motion.section className="arena-screen" key="arena" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><button className="arena-back" onClick={goHome}><ArrowLeft size={17} /> LEAVE MATCH</button><div className="arena-topline"><span>{config.game === "cricket" ? "HAND CRICKET" : "HAND BASEBALL"}</span><span>{config.mode.toUpperCase()} · {config.range} RANGE</span></div><div className="score-slate score-slate--opponent"><span>{names.opponent}</span><strong>{config.game === "cricket" ? match.scores.opponent : "●".repeat(match.strikes).padEnd(3, "○")}</strong><small>{config.game === "cricket" ? (match.target ? `TARGET ${match.target}` : "WAITING TO BAT") : `STRIKES ${match.strikes} / 3`}</small></div><div className="score-slate score-slate--player"><span>{names.player}</span><strong>{match.scores.player}</strong><small>{config.game === "cricket" ? `${match.innings === 1 ? "INNINGS 1" : "CHASE"} · ${match.batting === "player" ? "BATTING" : "BOWLING"}` : `TARGET ${match.baseballTarget}`}</small></div><div className="play-arena"><div className="arena-spotlight arena-spotlight--top" /><div className="arena-spotlight arena-spotlight--bottom" /><HandIllustration side="opponent" value={reveal ? lastTurn?.opponentChoice : undefined} label={names.opponent} active={reveal} reducedMotion={settings.reducedMotion} /><div className="versus-mark"><span>VS</span><small>{config.game === "cricket" ? `INNINGS ${match.innings}` : "AT BAT"}</small></div><HandIllustration side="player" value={reveal ? lastTurn?.playerChoice : undefined} label={names.player} active={reveal} reducedMotion={settings.reducedMotion} /><AnimatePresence>{arenaStage === "countdown" ? <motion.div className="countdown" initial={{ opacity: 0, scale: 0.84 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} key={countdown}>{countdown || "REVEAL"}</motion.div> : null}</AnimatePresence><AnimatePresence>{arenaStage === "resolved" && lastTurn ? <motion.div className={`turn-result turn-result--${lastTurn.event}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><strong>{lastTurn.message}</strong><span>{lastTurn.event === "out" ? "THE BATTER WALKS." : lastTurn.event === "strike" ? "MARK IT ON THE BOARD." : "NEXT MOVE IN A MOMENT."}</span></motion.div> : null}</AnimatePresence></div><div className="move-desk"><span className="move-prompt">{prompt}</span><div className={`number-tray number-tray--${config.range}`} role="group" aria-label="Choose your number">{numbers.map((number) => <motion.button key={number} disabled={!canChoose} onClick={() => commit(number)} className={`number-button ${number === 0 ? "number-button--duck" : ""}`} whileTap={{ scale: 0.93 }}><span>{number}</span>{number === 0 ? <small>DUCK</small> : null}</motion.button>)}</div></div></motion.section>;
    }
    return null;
  };

  return <div className={`game-shell ${settings.reducedMotion ? "reduce-motion" : ""}`}><canvas ref={canvasRef} className="babylon-canvas" aria-hidden="true" style={{ touchAction: "none" }} /><div className="arena-texture" /><div className="grain-layer" /><header className="game-header"><button className="brand-lockup" onClick={goHome} aria-label="Return to HAND PLAY menu"><span className="brand-crest" aria-hidden="true"><i /><i /><i /></span><span>HAND<br /><em>PLAY</em></span></button><div className="header-actions"><button className="header-icon" onClick={() => setPanel("history")} aria-label="Match history"><History size={18} /></button><button className="header-icon" onClick={() => setPanel("profile")} aria-label="Player profile"><UserRound size={18} /></button><button className="header-icon" onClick={() => setSettings((item) => ({ ...item, sound: !item.sound }))} aria-label="Sound toggle">{settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button><button className="header-icon" onClick={() => setPanel("settings")} aria-label="Settings"><Settings2 size={18} /></button></div></header><main className="game-stage"><AnimatePresence mode="wait">{screenView()}</AnimatePresence></main><AnimatePresence>{panel ? <motion.aside className="utility-drawer" initial={{ x: 340 }} animate={{ x: 0 }} exit={{ x: 340 }} transition={{ type: "spring", damping: 29, stiffness: 330 }}><div className="drawer-head"><span className="eyebrow">{panel === "history" ? "MATCH ARCHIVE" : panel === "profile" ? "PLAYER FILE" : "MATCH SETTINGS"}</span><button className="drawer-close" onClick={() => setPanel(null)}><X size={20} /></button></div>{panel === "history" ? <div className="history-list">{history.length ? history.map((item) => <div className="history-row" key={item.id}><span className={`history-game history-game--${item.game}`}>{item.game === "cricket" ? "C" : "B"}</span><span><strong>HAND {item.game.toUpperCase()}</strong><small>{item.createdAt}</small></span><span className={item.winner === "player" ? "history-win" : "history-loss"}>{item.winner === "player" ? "WIN" : "LOSS"}<small>{item.scoreText}</small></span></div>) : <div className="empty-state"><History size={34} /><strong>NO MATCHES YET.</strong><p>Finish a game and its scorecard will live here.</p></div>}</div> : null}{panel === "profile" ? <div className="profile-card"><div className="profile-avatar"><span className="brand-crest" aria-hidden="true"><i /><i /><i /></span></div><h3>PLAYER ONE</h3><p>LOCAL MATCH CARD</p><div className="profile-grid"><span><small>GAMES</small><strong>{profile.played}</strong></span><span><small>WINS</small><strong>{profile.wins}</strong></span><span><small>LOSSES</small><strong>{profile.losses}</strong></span><span><small>WIN RATE</small><strong>{profile.rate}%</strong></span></div><div className="profile-note"><Sparkles size={17} /> Scorecard updates from finished browser-session matches.</div></div> : null}{panel === "settings" ? <div className="settings-list">{([['sound','SOUND EFFECTS'],['music','MUSIC'],['vibration','VIBRATION'],['reducedMotion','REDUCED MOTION']] as const).map(([key,label]) => <button key={key} className="setting-row" onClick={() => setSettings((item) => ({ ...item, [key]: !item[key] }))}><span>{label}</span><i className={settings[key] ? "switch is-on" : "switch"}><b /></i></button>)}<div className="language-row"><span>LANGUAGE</span><strong>ENGLISH</strong></div><p className="settings-footnote">Sound controls are ready for match cues after the first player gesture. Music stays off by default.</p></div> : null}</motion.aside> : null}</AnimatePresence></div>;
}
