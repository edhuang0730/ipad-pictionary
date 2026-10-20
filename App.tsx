import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Platform } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GameEngine } from './src/engine/GameEngine';
import { EmbeddedGameServer, ServerStatus } from './src/server/EmbeddedServer';
import {
  ClientToServerMessage,
  GameSettings,
  HostGameState,
  Point,
  ServerToClientMessage,
  Stroke,
} from './src/types/game';
import { LobbyScreen } from './src/components/LobbyScreen';
import { IntermissionScreen } from './src/components/IntermissionScreen';
import { DrawingTurnScreen } from './src/components/DrawingTurnScreen';
import { GameOverScreen } from './src/components/GameOverScreen';
import { soundFX } from './src/utils/soundEffects';

const DEMO_NAMES = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Quinn'];

export default function App() {
  useKeepAwake();

  const engineRef = useRef<GameEngine>(new GameEngine());
  const serverRef = useRef<EmbeddedGameServer | null>(null);
  const clientToPlayerIdRef = useRef<Map<string, string>>(new Map());
  const demoCounterRef = useRef<number>(0);

  const [gameState, setGameState] = useState<HostGameState>(() =>
    engineRef.current.getHostState()
  );
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    running: false,
    mode: 'offline',
    ipAddress: '127.0.0.1',
    port: 8080,
    url: 'http://127.0.0.1:8080',
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const syncAndBroadcastState = useCallback(() => {
    const engine = engineRef.current;
    const hostState = engine.getHostState();
    setGameState(hostState);
    serverRef.current?.broadcast({
      type: 'STATE_SYNC',
      state: engine.getPublicState(),
    });
  }, []);

  // Lock iPad to Landscape Orientation on mount
  useEffect(() => {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      ).catch(() => {});
    }
  }, []);

  // Start Embedded HTTP + WebSocket Server on mount
  useEffect(() => {
    const engine = engineRef.current;

    const handleClientMessage = (
      clientId: string,
      message: ClientToServerMessage,
      reply: (msg: ServerToClientMessage) => void
    ) => {
      if (message.type === 'JOIN_PLAYER' || message.type === 'UPDATE_PROFILE') {
        const player = engine.upsertPlayer({
          playerId: message.playerId,
          name: message.name,
          avatarDataUrl: message.avatarDataUrl,
        });
        clientToPlayerIdRef.current.set(clientId, player.id);

        soundFX.playPlayerJoin();

        reply({
          type: 'WELCOME',
          assignedPlayerId: player.id,
          state: engine.getPublicState(),
        });

        setGameState(engine.getHostState());
        serverRef.current?.broadcast({
          type: 'STATE_SYNC',
          state: engine.getPublicState(),
        });
      } else if (message.type === 'PING') {
        reply({ type: 'PONG' });
      }
    };

    const handleClientDisconnect = (clientId: string) => {
      const playerId = clientToPlayerIdRef.current.get(clientId);
      if (playerId) {
        clientToPlayerIdRef.current.delete(clientId);
        engine.setPlayerConnected(playerId, false);
        setGameState(engine.getHostState());
        serverRef.current?.broadcast({
          type: 'STATE_SYNC',
          state: engine.getPublicState(),
        });
      }
    };

    const server = new EmbeddedGameServer({
      onMessage: handleClientMessage,
      onDisconnect: handleClientDisconnect,
      onStatusChange: (st) => setServerStatus(st),
    });

    serverRef.current = server;
    server.start(8080);

    return () => {
      server.stop();
    };
  }, []);

  // 1-Second Host Game Timer Loop (handles 10s Intermission & Active Turn Countdown)
  useEffect(() => {
    const interval = setInterval(() => {
      const engine = engineRef.current;
      const currentPhase = engine.getHostState().phase;
      if (currentPhase !== 'INTERMISSION' && currentPhase !== 'DRAWING') {
        return;
      }

      const { phaseChanged } = engine.tickSecond();
      const updated = engine.getHostState();
      setGameState(updated);

      if (phaseChanged) {
        if (updated.phase === 'DRAWING') {
          soundFX.playTurnStart();
        } else if (updated.phase === 'INTERMISSION') {
          soundFX.playTurnEnd();
        } else if (updated.phase === 'GAME_OVER') {
          soundFX.playVictoryFanfare();
        }

        serverRef.current?.broadcast({
          type: 'STATE_SYNC',
          state: engine.getPublicState(),
        });
      } else {
        // Play countdown ticks on last seconds
        if (
          updated.phase === 'INTERMISSION' &&
          updated.intermissionTimeRemaining <= 3 &&
          updated.intermissionTimeRemaining > 0
        ) {
          soundFX.playCountdownTick(false);
        } else if (
          updated.phase === 'DRAWING' &&
          updated.turnTimeRemaining <= 5 &&
          updated.turnTimeRemaining > 0
        ) {
          soundFX.playCountdownTick(true);
        }

        serverRef.current?.broadcast({
          type: 'TIMER_TICK',
          phase: updated.phase,
          turnTimeRemaining: updated.turnTimeRemaining,
          intermissionTimeRemaining: updated.intermissionTimeRemaining,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================================================
  // Host UI Event Handlers
  // ==========================================================================

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFX.setMuted(next);
  };

  const handleUpdateSettings = (partial: Partial<GameSettings>) => {
    engineRef.current.updateSettings(partial);
    syncAndBroadcastState();
  };

  const handleRemovePlayer = (playerId: string) => {
    engineRef.current.removePlayer(playerId);
    syncAndBroadcastState();
  };

  const handleAddDemoPlayer = () => {
    const idx = demoCounterRef.current % DEMO_NAMES.length;
    demoCounterRef.current += 1;
    const name = `${DEMO_NAMES[idx]} ${demoCounterRef.current}`;
    engineRef.current.upsertPlayer({
      name,
      avatarDataUrl: '',
    });
    soundFX.playPlayerJoin();
    syncAndBroadcastState();
  };

  const handleStartGame = () => {
    const started = engineRef.current.startGame(true);
    if (started) {
      soundFX.playCountdownTick(false);
      syncAndBroadcastState();
    }
  };

  const handleStartTurnNow = () => {
    engineRef.current.beginDrawingTurn();
    soundFX.playTurnStart();
    syncAndBroadcastState();
  };

  const handleStrokeStart = (stroke: Stroke) => {
    engineRef.current.startStroke(stroke);
    setGameState(engineRef.current.getHostState());
    serverRef.current?.broadcast({
      type: 'STROKE_START',
      stroke,
    });
  };

  const handleStrokeMove = (strokeId: string, points: Point[]) => {
    engineRef.current.appendStrokePoints(strokeId, points);
    setGameState(engineRef.current.getHostState());
    serverRef.current?.broadcast({
      type: 'STROKE_MOVE',
      strokeId,
      points,
    });
  };

  const handleStrokeEnd = (strokeId: string) => {
    serverRef.current?.broadcast({
      type: 'STROKE_END',
      strokeId,
    });
  };

  const handleUndoStroke = () => {
    const remaining = engineRef.current.undoStroke();
    setGameState(engineRef.current.getHostState());
    serverRef.current?.broadcast({
      type: 'STROKE_UNDO',
      strokes: remaining,
    });
  };

  const handleClearCanvas = () => {
    engineRef.current.clearCanvas();
    setGameState(engineRef.current.getHostState());
    serverRef.current?.broadcast({
      type: 'CANVAS_CLEAR',
    });
  };

  const handleSkipWord = () => {
    engineRef.current.skipWord();
    soundFX.playSkipWord();
    serverRef.current?.broadcast({ type: 'CANVAS_CLEAR' });
    syncAndBroadcastState();
  };

  const handleSelectCorrectPlayer = (guesserId: string) => {
    const engine = engineRef.current;
    const event = engine.markPlayerCorrect(guesserId);
    if (!event) return;

    soundFX.playCorrectGuess();
    setGameState(engine.getHostState());

    serverRef.current?.broadcast({
      type: 'WORD_GUESSED',
      event,
      state: engine.getPublicState(),
    });
  };

  const handleEndTurnEarly = () => {
    engineRef.current.endCurrentTurn();
    const nextPhase = engineRef.current.getHostState().phase;
    if (nextPhase === 'GAME_OVER') {
      soundFX.playVictoryFanfare();
    } else {
      soundFX.playTurnEnd();
    }
    syncAndBroadcastState();
  };

  const handleReturnToLobby = () => {
    engineRef.current.returnToLobby();
    syncAndBroadcastState();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden />
      {gameState.phase === 'LOBBY' && (
        <LobbyScreen
          players={gameState.players}
          settings={gameState.settings}
          serverStatus={serverStatus}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onUpdateSettings={handleUpdateSettings}
          onRemovePlayer={handleRemovePlayer}
          onAddDemoPlayer={handleAddDemoPlayer}
          onStartGame={handleStartGame}
        />
      )}

      {gameState.phase === 'INTERMISSION' && (
        <IntermissionScreen
          state={gameState}
          onStartTurnNow={handleStartTurnNow}
          onEndGameEarly={handleReturnToLobby}
        />
      )}

      {gameState.phase === 'DRAWING' && (
        <DrawingTurnScreen
          state={gameState}
          serverUrl={serverStatus.url}
          onStrokeStart={handleStrokeStart}
          onStrokeMove={handleStrokeMove}
          onStrokeEnd={handleStrokeEnd}
          onUndo={handleUndoStroke}
          onClear={handleClearCanvas}
          onSkipWord={handleSkipWord}
          onSelectCorrectPlayer={handleSelectCorrectPlayer}
          onEndTurnEarly={handleEndTurnEarly}
        />
      )}

      {gameState.phase === 'GAME_OVER' && (
        <GameOverScreen
          state={gameState}
          onPlayAgain={handleStartGame}
          onReturnToLobby={handleReturnToLobby}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
