export type WordCategory =
  | 'All'
  | 'Animals & Nature'
  | 'Food & Objects'
  | 'Actions & Phrases'
  | 'Pop Culture & Movies'
  | 'Everyday Life';

export type WordDifficulty = 'All' | 'Easy' | 'Medium' | 'Hard';

export interface WordEntry {
  word: string;
  category: Exclude<WordCategory, 'All'>;
  difficulty: Exclude<WordDifficulty, 'All'>;
}

export interface Point {
  /** Normalized X coordinate (0.0 to 1.0) */
  x: number;
  /** Normalized Y coordinate (0.0 to 1.0) */
  y: number;
}

export interface FillRect {
  /** Normalized X coordinate (0.0 to 1.0) */
  x: number;
  /** Normalized Y coordinate (0.0 to 1.0) */
  y: number;
  /** Normalized width (0.0 to 1.0) */
  w: number;
  /** Normalized height (0.0 to 1.0) */
  h: number;
}

export interface Stroke {
  id: string;
  color: string;
  /** Normalized stroke width relative to canvas width (e.g. 0.008) */
  width: number;
  points: Point[];
  isEraser?: boolean;
  /** True when this stroke represents a bucket flood-fill operation */
  isFill?: boolean;
  /** Vertically-merged normalized rectangles representing the flood-filled region */
  fillRects?: FillRect[];
}

export interface Player {
  id: string;
  name: string;
  /** Base64 Data URL of the simplified 128x128 circular selfie avatar */
  avatarDataUrl: string;
  score: number;
  wordsGuessed: number;
  wordsDrawnSuccess: number;
  connected: boolean;
  joinedAt: number;
}

export interface GameSettings {
  /** Duration of each player's drawing turn in seconds (e.g. 60) */
  turnDurationSec: number;
  /** Number of full rounds where every player draws once per round */
  totalRounds: number;
  /** Intermission countdown duration in seconds (default 10s) */
  intermissionDurationSec: number;
  category: WordCategory;
  difficulty: WordDifficulty;
}

export type GamePhase = 'LOBBY' | 'INTERMISSION' | 'DRAWING' | 'GAME_OVER';

export interface CorrectGuessEvent {
  id: string;
  guesserId: string;
  guesserName: string;
  guesserAvatar: string;
  drawerId: string;
  drawerName: string;
  word: string;
  guesserPointsAwarded: number;
  drawerPointsAwarded: number;
  timestamp: number;
}

export interface PublicGameState {
  phase: GamePhase;
  players: Player[];
  settings: GameSettings;
  /** 1-indexed current round (1..totalRounds) */
  currentRound: number;
  /** Index into players[] of the active/upcoming drawer */
  currentDrawerIndex: number;
  currentDrawerId: string | null;
  turnTimeRemaining: number;
  intermissionTimeRemaining: number;
  /** Masked hint shown to phones (e.g. "_ _ _   _ _ _ _ _ (3, 5)") */
  maskedWordHint: string;
  currentWordCategory: string;
  currentWordDifficulty: string;
  /** Number of words successfully drawn in the current turn */
  turnWordsCompleted: number;
  /** Current active canvas strokes */
  strokes: Stroke[];
  /** Latest correct guess celebration event */
  lastCorrectEvent: CorrectGuessEvent | null;
  /** Word revealed briefly when turn expires or after correct guess */
  revealedWord: string | null;
}

export interface HostGameState extends PublicGameState {
  /** Secret word visible ONLY on the iPad to the current drawer */
  currentWord: string;
}

// ============================================================================
// WebSocket Message Protocol (Phone <-> iPad Embedded Server)
// ============================================================================

export type ClientToServerMessage =
  | {
      type: 'JOIN_PLAYER';
      playerId?: string;
      name: string;
      avatarDataUrl: string;
    }
  | {
      type: 'UPDATE_PROFILE';
      playerId: string;
      name: string;
      avatarDataUrl: string;
    }
  | {
      type: 'PING';
    }
  // Host Bridge messages (used when testing in web/dev mode with LAN companion server)
  | {
      type: 'REGISTER_HOST';
    }
  | {
      type: 'HOST_BROADCAST';
      payload: ServerToClientMessage;
    };

export type ServerToClientMessage =
  | {
      type: 'WELCOME';
      assignedPlayerId: string;
      state: PublicGameState;
    }
  | {
      type: 'STATE_SYNC';
      state: PublicGameState;
    }
  | {
      type: 'TIMER_TICK';
      phase: GamePhase;
      turnTimeRemaining: number;
      intermissionTimeRemaining: number;
    }
  | {
      type: 'STROKE_START';
      stroke: Stroke;
    }
  | {
      type: 'STROKE_MOVE';
      strokeId: string;
      points: Point[];
    }
  | {
      type: 'STROKE_END';
      strokeId: string;
    }
  | {
      type: 'STROKE_UNDO';
      strokes: Stroke[];
    }
  | {
      type: 'CANVAS_CLEAR';
    }
  | {
      type: 'WORD_GUESSED';
      event: CorrectGuessEvent;
      state: PublicGameState;
    }
  | {
      type: 'PONG';
    };
