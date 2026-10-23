import {
  CorrectGuessEvent,
  GameSettings,
  HostGameState,
  Player,
  Point,
  PublicGameState,
  Stroke,
  WordEntry,
} from '../types/game';
import { buildShuffledDeck, createMaskedWordHint } from '../data/words';

export const GUESSER_POINTS = 100;
export const DRAWER_POINTS = 50;

export const DEFAULT_SETTINGS: GameSettings = {
  turnDurationSec: 60,
  totalRounds: 3,
  intermissionDurationSec: 10,
  category: 'All',
  difficulty: 'All',
};

export class GameEngine {
  private state: HostGameState;
  private deck: WordEntry[] = [];
  private deckCursor: number = 0;

  constructor(initialSettings?: Partial<GameSettings>) {
    const settings: GameSettings = {
      ...DEFAULT_SETTINGS,
      ...initialSettings,
    };

    this.state = {
      phase: 'LOBBY',
      players: [],
      settings,
      currentRound: 1,
      currentDrawerIndex: 0,
      currentDrawerId: null,
      turnTimeRemaining: settings.turnDurationSec,
      intermissionTimeRemaining: settings.intermissionDurationSec,
      currentWord: '',
      maskedWordHint: '',
      currentWordCategory: '',
      currentWordDifficulty: '',
      turnWordsCompleted: 0,
      strokes: [],
      lastCorrectEvent: null,
      revealedWord: null,
    };

    this.reshuffleDeck();
  }

  private reshuffleDeck(): void {
    this.deck = buildShuffledDeck(
      this.state.settings.category,
      this.state.settings.difficulty
    );
    this.deckCursor = 0;
  }

  private drawNextWordEntry(): WordEntry {
    if (this.deck.length === 0 || this.deckCursor >= this.deck.length) {
      this.reshuffleDeck();
    }
    const entry = this.deck[this.deckCursor];
    this.deckCursor += 1;
    return entry;
  }

  private assignNewWord(): void {
    const entry = this.drawNextWordEntry();
    this.state.currentWord = entry.word;
    this.state.maskedWordHint = createMaskedWordHint(entry.word);
    this.state.currentWordCategory = entry.category;
    this.state.currentWordDifficulty = entry.difficulty;
  }

  public getHostState(): HostGameState {
    return {
      ...this.state,
      players: this.state.players.map((p) => ({ ...p })),
      settings: { ...this.state.settings },
      strokes: this.state.strokes.map((s) => ({
        ...s,
        points: [...s.points],
        fillRects: s.fillRects ? s.fillRects.map((r) => ({ ...r })) : undefined,
      })),
    };
  }

  public getPublicState(): PublicGameState {
    const hostState = this.getHostState();
    const { currentWord, ...publicState } = hostState;
    return publicState;
  }

  public updateSettings(partial: Partial<GameSettings>): PublicGameState {
    const prevCategory = this.state.settings.category;
    const prevDifficulty = this.state.settings.difficulty;

    this.state.settings = {
      ...this.state.settings,
      ...partial,
    };

    if (
      this.state.phase === 'LOBBY' &&
      (prevCategory !== this.state.settings.category ||
        prevDifficulty !== this.state.settings.difficulty)
    ) {
      this.reshuffleDeck();
    }

    if (this.state.phase === 'LOBBY') {
      this.state.turnTimeRemaining = this.state.settings.turnDurationSec;
      this.state.intermissionTimeRemaining =
        this.state.settings.intermissionDurationSec;
    }

    return this.getPublicState();
  }

  /**
   * Registers a new player or reconnects an existing player by ID or matching name.
   */
  public upsertPlayer(params: {
    playerId?: string;
    name: string;
    avatarDataUrl: string;
  }): Player {
    const trimmedName = params.name.trim().slice(0, 24) || 'Player';
    let existing = params.playerId
      ? this.state.players.find((p) => p.id === params.playerId)
      : undefined;

    if (!existing) {
      existing = this.state.players.find(
        (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
      );
    }

    if (existing) {
      existing.name = trimmedName;
      if (params.avatarDataUrl) {
        existing.avatarDataUrl = params.avatarDataUrl;
      }
      existing.connected = true;
      return { ...existing };
    }

    const newPlayer: Player = {
      id:
        params.playerId ||
        `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      name: trimmedName,
      avatarDataUrl: params.avatarDataUrl,
      score: 0,
      wordsGuessed: 0,
      wordsDrawnSuccess: 0,
      connected: true,
      joinedAt: Date.now(),
    };

    this.state.players.push(newPlayer);
    if (!this.state.currentDrawerId && this.state.players.length === 1) {
      this.state.currentDrawerIndex = 0;
      this.state.currentDrawerId = newPlayer.id;
    }

    return { ...newPlayer };
  }

  public setPlayerConnected(playerId: string, connected: boolean): void {
    const player = this.state.players.find((p) => p.id === playerId);
    if (player) {
      player.connected = connected;
    }
  }

  public removePlayer(playerId: string): void {
    const idx = this.state.players.findIndex((p) => p.id === playerId);
    if (idx === -1) return;

    this.state.players.splice(idx, 1);

    if (this.state.players.length === 0) {
      this.returnToLobby();
      return;
    }

    if (this.state.currentDrawerIndex >= this.state.players.length) {
      this.state.currentDrawerIndex = 0;
    }
    this.state.currentDrawerId =
      this.state.players[this.state.currentDrawerIndex]?.id ?? null;
  }

  /**
   * Starts a new game from the Lobby (or restarts after Game Over).
   * Requires at least 2 players.
   */
  public startGame(resetScores: boolean = true): boolean {
    if (this.state.players.length < 2) {
      return false;
    }

    if (resetScores) {
      for (const player of this.state.players) {
        player.score = 0;
        player.wordsGuessed = 0;
        player.wordsDrawnSuccess = 0;
      }
    }

    this.reshuffleDeck();
    this.state.currentRound = 1;
    this.state.currentDrawerIndex = 0;
    this.state.currentDrawerId = this.state.players[0].id;
    this.state.strokes = [];
    this.state.lastCorrectEvent = null;
    this.state.revealedWord = null;
    this.state.turnWordsCompleted = 0;
    this.state.phase = 'INTERMISSION';
    this.state.intermissionTimeRemaining =
      this.state.settings.intermissionDurationSec;
    this.state.turnTimeRemaining = this.state.settings.turnDurationSec;

    return true;
  }

  /**
   * Starts the current drawer's active drawing turn (called when the 10s intermission ends
   * or when the drawer taps "Start Turn Now" on the iPad).
   */
  public beginDrawingTurn(): void {
    if (this.state.players.length === 0) return;

    const drawer =
      this.state.players[this.state.currentDrawerIndex] ??
      this.state.players[0];
    this.state.currentDrawerId = drawer.id;
    this.state.phase = 'DRAWING';
    this.state.turnTimeRemaining = this.state.settings.turnDurationSec;
    this.state.turnWordsCompleted = 0;
    this.state.strokes = [];
    this.state.revealedWord = null;
    this.assignNewWord();
  }

  /**
   * Called once per second by the host game loop.
   * Returns true if a phase transition occurred.
   */
  public tickSecond(): { phaseChanged: boolean } {
    if (this.state.phase === 'INTERMISSION') {
      if (this.state.intermissionTimeRemaining > 1) {
        this.state.intermissionTimeRemaining -= 1;
        return { phaseChanged: false };
      } else {
        this.state.intermissionTimeRemaining = 0;
        this.beginDrawingTurn();
        return { phaseChanged: true };
      }
    }

    if (this.state.phase === 'DRAWING') {
      if (this.state.turnTimeRemaining > 1) {
        this.state.turnTimeRemaining -= 1;
        return { phaseChanged: false };
      } else {
        this.state.turnTimeRemaining = 0;
        this.endCurrentTurn();
        return { phaseChanged: true };
      }
    }

    return { phaseChanged: false };
  }

  /**
   * Ends the current drawer's turn and rotates to the next player's 10s intermission,
   * or transitions to GAME_OVER if all players have completed all rounds.
   */
  public endCurrentTurn(): void {
    this.state.revealedWord = this.state.currentWord || null;
    this.state.strokes = [];

    const nextDrawerIdx = this.state.currentDrawerIndex + 1;
    if (nextDrawerIdx < this.state.players.length) {
      this.state.currentDrawerIndex = nextDrawerIdx;
      this.state.currentDrawerId = this.state.players[nextDrawerIdx].id;
      this.state.phase = 'INTERMISSION';
      this.state.intermissionTimeRemaining =
        this.state.settings.intermissionDurationSec;
      return;
    }

    // Completed a full round across all players
    const nextRound = this.state.currentRound + 1;
    if (nextRound <= this.state.settings.totalRounds) {
      this.state.currentRound = nextRound;
      this.state.currentDrawerIndex = 0;
      this.state.currentDrawerId = this.state.players[0]?.id ?? null;
      this.state.phase = 'INTERMISSION';
      this.state.intermissionTimeRemaining =
        this.state.settings.intermissionDurationSec;
    } else {
      this.state.phase = 'GAME_OVER';
    }
  }

  /**
   * Rapid-fire word completion:
   * Awards points to the guesser AND the current drawer, clears the canvas,
   * and immediately loads the next word while the turn timer keeps running.
   */
  public markPlayerCorrect(guesserId: string): CorrectGuessEvent | null {
    if (this.state.phase !== 'DRAWING') return null;

    const guesser = this.state.players.find((p) => p.id === guesserId);
    const drawer = this.state.players[this.state.currentDrawerIndex];
    if (!guesser || !drawer || guesser.id === drawer.id) {
      return null;
    }

    const guessedWord = this.state.currentWord;

    guesser.score += GUESSER_POINTS;
    guesser.wordsGuessed += 1;

    drawer.score += DRAWER_POINTS;
    drawer.wordsDrawnSuccess += 1;

    this.state.turnWordsCompleted += 1;

    const event: CorrectGuessEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      guesserId: guesser.id,
      guesserName: guesser.name,
      guesserAvatar: guesser.avatarDataUrl,
      drawerId: drawer.id,
      drawerName: drawer.name,
      word: guessedWord,
      guesserPointsAwarded: GUESSER_POINTS,
      drawerPointsAwarded: DRAWER_POINTS,
      timestamp: Date.now(),
    };

    this.state.lastCorrectEvent = event;
    this.state.revealedWord = guessedWord;
    this.state.strokes = [];
    this.assignNewWord();

    return event;
  }

  /**
   * Skips the current word on the iPad, clears the canvas, and loads a new word.
   */
  public skipWord(): void {
    if (this.state.phase !== 'DRAWING') return;
    this.state.strokes = [];
    this.assignNewWord();
  }

  public returnToLobby(): void {
    this.state.phase = 'LOBBY';
    this.state.currentRound = 1;
    this.state.currentDrawerIndex = 0;
    this.state.currentDrawerId = this.state.players[0]?.id ?? null;
    this.state.strokes = [];
    this.state.currentWord = '';
    this.state.maskedWordHint = '';
    this.state.lastCorrectEvent = null;
    this.state.revealedWord = null;
    this.state.turnTimeRemaining = this.state.settings.turnDurationSec;
    this.state.intermissionTimeRemaining =
      this.state.settings.intermissionDurationSec;
  }

  // ==========================================================================
  // Drawing Canvas Stroke Operations
  // ==========================================================================

  public startStroke(stroke: Stroke): void {
    if (this.state.phase !== 'DRAWING') return;
    this.state.strokes.push({
      ...stroke,
      points: [...stroke.points],
      fillRects: stroke.fillRects
        ? stroke.fillRects.map((r) => ({ ...r }))
        : undefined,
    });
  }

  public appendStrokePoints(strokeId: string, points: Point[]): void {
    if (this.state.phase !== 'DRAWING' || points.length === 0) return;
    const stroke = this.state.strokes.find((s) => s.id === strokeId);
    if (!stroke) return;
    stroke.points.push(...points);
  }

  public undoStroke(): Stroke[] {
    if (this.state.phase !== 'DRAWING') return this.state.strokes;
    this.state.strokes.pop();
    return this.getHostState().strokes;
  }

  public clearCanvas(): void {
    this.state.strokes = [];
  }
}
