import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DRAWER_POINTS,
  GameEngine,
  GUESSER_POINTS,
} from '../engine/GameEngine';
import { createMaskedWordHint } from '../data/words';

describe('GameEngine State Machine & Rapid-Fire Rules', () => {
  it('generates masked letter hints without exposing the secret word', () => {
    const hint = createMaskedWordHint('Ice Cream');
    assert.equal(hint, '_ _ _   _ _ _ _ _  (3, 5)');
  });

  it('requires at least 2 players to start and begins with a 10-second intermission', () => {
    const engine = new GameEngine({
      turnDurationSec: 45,
      totalRounds: 2,
      intermissionDurationSec: 10,
    });

    const p1 = engine.upsertPlayer({
      name: 'Alice',
      avatarDataUrl: 'data:image/jpeg;base64,alice',
    });
    assert.equal(engine.startGame(), false);

    const p2 = engine.upsertPlayer({
      name: 'Bob',
      avatarDataUrl: 'data:image/jpeg;base64,bob',
    });
    assert.equal(engine.startGame(), true);

    const st = engine.getHostState();
    assert.equal(st.phase, 'INTERMISSION');
    assert.equal(st.intermissionTimeRemaining, 10);
    assert.equal(st.currentRound, 1);
    assert.equal(st.currentDrawerIndex, 0);
    assert.equal(st.currentDrawerId, p1.id);
    assert.ok(p2.id);
  });

  it('transitions from 10-second intermission into active drawing and supports rapid-fire scoring', () => {
    const engine = new GameEngine({
      turnDurationSec: 30,
      totalRounds: 2,
      intermissionDurationSec: 10,
    });

    const alice = engine.upsertPlayer({
      name: 'Alice',
      avatarDataUrl: 'data:image/jpeg;base64,alice',
    });
    const bob = engine.upsertPlayer({
      name: 'Bob',
      avatarDataUrl: 'data:image/jpeg;base64,bob',
    });

    engine.startGame();

    // Tick 9 seconds of intermission -> still in INTERMISSION with 1s remaining
    for (let i = 0; i < 9; i++) {
      const res = engine.tickSecond();
      assert.equal(res.phaseChanged, false);
    }
    assert.equal(engine.getHostState().intermissionTimeRemaining, 1);

    // 10th second transitions to DRAWING
    const tenth = engine.tickSecond();
    assert.equal(tenth.phaseChanged, true);
    assert.equal(engine.getHostState().phase, 'DRAWING');
    assert.equal(engine.getHostState().turnTimeRemaining, 30);

    const firstWord = engine.getHostState().currentWord;
    assert.ok(firstWord.length > 0);

    // Public state sent to phones must NOT contain currentWord
    const publicState = engine.getPublicState() as any;
    assert.equal(publicState.currentWord, undefined);
    assert.ok(publicState.maskedWordHint.length > 0);

    // Drawer draws a stroke
    engine.startStroke({
      id: 's1',
      color: '#111827',
      width: 0.008,
      points: [{ x: 0.2, y: 0.3 }],
    });
    engine.appendStrokePoints('s1', [{ x: 0.5, y: 0.6 }]);
    assert.equal(engine.getHostState().strokes.length, 1);

    // Bob shouts out the right answer and Alice taps Bob's avatar on the iPad
    const event = engine.markPlayerCorrect(bob.id);
    assert.ok(event);
    assert.equal(event.guesserId, bob.id);
    assert.equal(event.drawerId, alice.id);
    assert.equal(event.word, firstWord);

    const afterGuess = engine.getHostState();
    // Rapid-fire: still in DRAWING phase, canvas cleared, new word assigned, points awarded!
    assert.equal(afterGuess.phase, 'DRAWING');
    assert.equal(afterGuess.strokes.length, 0);
    assert.notEqual(afterGuess.currentWord, firstWord);
    assert.equal(afterGuess.turnWordsCompleted, 1);

    const updatedAlice = afterGuess.players.find((p) => p.id === alice.id)!;
    const updatedBob = afterGuess.players.find((p) => p.id === bob.id)!;
    assert.equal(updatedBob.score, GUESSER_POINTS);
    assert.equal(updatedAlice.score, DRAWER_POINTS);
    assert.equal(updatedBob.wordsGuessed, 1);
    assert.equal(updatedAlice.wordsDrawnSuccess, 1);
  });

  it('rotates through all players and ends the game after all configured rounds complete', () => {
    const engine = new GameEngine({
      turnDurationSec: 5,
      totalRounds: 2,
      intermissionDurationSec: 10,
    });

    const p1 = engine.upsertPlayer({ name: 'P1', avatarDataUrl: '' });
    const p2 = engine.upsertPlayer({ name: 'P2', avatarDataUrl: '' });

    engine.startGame();

    // Round 1, Turn 1 (P1 draws)
    engine.beginDrawingTurn();
    assert.equal(engine.getHostState().currentRound, 1);
    assert.equal(engine.getHostState().currentDrawerId, p1.id);

    // Expire P1's 5-second turn
    for (let i = 0; i < 5; i++) {
      engine.tickSecond();
    }
    // Should now be in 10s INTERMISSION for P2 (Round 1, Turn 2)
    assert.equal(engine.getHostState().phase, 'INTERMISSION');
    assert.equal(engine.getHostState().currentRound, 1);
    assert.equal(engine.getHostState().currentDrawerId, p2.id);

    // Start P2's turn and let it expire
    engine.beginDrawingTurn();
    for (let i = 0; i < 5; i++) {
      engine.tickSecond();
    }
    // Should now advance to Round 2, Turn 1 (P1 draws)
    assert.equal(engine.getHostState().phase, 'INTERMISSION');
    assert.equal(engine.getHostState().currentRound, 2);
    assert.equal(engine.getHostState().currentDrawerId, p1.id);

    // Round 2, Turn 1 (P1)
    engine.beginDrawingTurn();
    engine.endCurrentTurn();
    assert.equal(engine.getHostState().phase, 'INTERMISSION');
    assert.equal(engine.getHostState().currentRound, 2);
    assert.equal(engine.getHostState().currentDrawerId, p2.id);

    // Round 2, Turn 2 (P2) -> After this turn ends, all 2 rounds are complete -> GAME_OVER!
    engine.beginDrawingTurn();
    engine.endCurrentTurn();
    assert.equal(engine.getHostState().phase, 'GAME_OVER');
  });
});
