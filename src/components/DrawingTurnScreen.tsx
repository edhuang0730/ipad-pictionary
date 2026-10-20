import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { HostGameState, Point, Stroke } from '../types/game';
import { DrawingCanvas } from './DrawingCanvas';
import { PlayerAvatar } from './PlayerAvatar';

interface DrawingTurnScreenProps {
  state: HostGameState;
  serverUrl: string;
  onStrokeStart: (stroke: Stroke) => void;
  onStrokeMove: (strokeId: string, points: Point[]) => void;
  onStrokeEnd: (strokeId: string) => void;
  onUndo: () => void;
  onClear: () => void;
  onSkipWord: () => void;
  onSelectCorrectPlayer: (guesserId: string) => void;
  onEndTurnEarly: () => void;
}

export const DrawingTurnScreen: React.FC<DrawingTurnScreenProps> = ({
  state,
  serverUrl,
  onStrokeStart,
  onStrokeMove,
  onStrokeEnd,
  onUndo,
  onClear,
  onSkipWord,
  onSelectCorrectPlayer,
  onEndTurnEarly,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [recentAwardBanner, setRecentAwardBanner] = useState<string | null>(
    null
  );

  const currentDrawer =
    state.players[state.currentDrawerIndex] ?? state.players[0];
  const guessers = state.players.filter(
    (p) => !currentDrawer || p.id !== currentDrawer.id
  );

  const isUrgent = state.turnTimeRemaining <= 10;
  const isWarning = state.turnTimeRemaining <= 20 && !isUrgent;

  const handlePlayerTap = (guesserId: string, guesserName: string) => {
    const previousWord = state.currentWord;
    onSelectCorrectPlayer(guesserId);
    setRecentAwardBanner(
      `🎉 ${guesserName} guessed "${previousWord}"! (+100 pts)`
    );
    setTimeout(() => {
      setRecentAwardBanner((prev) =>
        prev?.includes(previousWord) ? null : prev
      );
    }, 2200);
  };

  return (
    <View style={styles.container}>
      {/* Top HUD Bar */}
      <View style={styles.topHud}>
        {/* Drawer Identity */}
        <View style={styles.drawerBox}>
          {currentDrawer && (
            <PlayerAvatar
              uri={currentDrawer.avatarDataUrl}
              name={currentDrawer.name}
              size={46}
              borderColor="#FDE047"
            />
          )}
          <View>
            <Text style={styles.roundMini}>
              ROUND {state.currentRound}/{state.settings.totalRounds} • DRAWER
            </Text>
            <Text style={styles.drawerName} numberOfLines={1}>
              {currentDrawer ? currentDrawer.name : 'Drawer'}
            </Text>
          </View>
        </View>

        {/* Secret Word Prompt Banner */}
        <View style={styles.secretWordCard}>
          <View style={styles.wordMetaCol}>
            <Text style={styles.secretLabel}>DRAW THIS SECRET WORD:</Text>
            <Text style={styles.categorySub}>
              {state.currentWordCategory} ({state.currentWordDifficulty})
            </Text>
          </View>

          <Text style={styles.secretWordText}>{state.currentWord}</Text>

          <TouchableOpacity onPress={onSkipWord} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>⏭️ Skip Word</Text>
          </TouchableOpacity>
        </View>

        {/* Timer & Controls */}
        <View style={styles.hudRight}>
          <View
            style={[
              styles.timerBox,
              isWarning && styles.timerBoxWarning,
              isUrgent && styles.timerBoxUrgent,
            ]}
          >
            <Text
              style={[
                styles.timerText,
                isWarning && { color: '#FBBF24' },
                isUrgent && { color: '#F87171' },
              ]}
            >
              ⏱️ {state.turnTimeRemaining}s
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowQrModal(true)}
            style={styles.qrMiniBtn}
          >
            <Text style={styles.qrMiniBtnText}>📱 QR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rapid-Fire Celebration Toast Banner */}
      {recentAwardBanner ? (
        <View style={styles.awardToast}>
          <Text style={styles.awardToastText}>{recentAwardBanner}</Text>
        </View>
      ) : null}

      {/* Main Split Area: Canvas (Left) + "Who Got It Right?" Selector (Right) */}
      <View style={styles.workspaceRow}>
        <View style={styles.canvasCol}>
          <DrawingCanvas
            strokes={state.strokes}
            onStrokeStart={onStrokeStart}
            onStrokeMove={onStrokeMove}
            onStrokeEnd={onStrokeEnd}
            onUndo={onUndo}
            onClear={onClear}
          />
        </View>

        {/* Right Sidebar: Tap Player Who Guessed Correctly */}
        <View style={styles.guessersSidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>🎯 Who Got It Right?</Text>
            <Text style={styles.sidebarHint}>
              Tap the player who shouted "{state.currentWord}" to award points &
              get the next word!
            </Text>
          </View>

          <ScrollView
            style={styles.guessersScroll}
            contentContainerStyle={styles.guessersList}
          >
            {guessers.map((player) => (
              <TouchableOpacity
                key={player.id}
                onPress={() => handlePlayerTap(player.id, player.name)}
                style={styles.guesserBtn}
                activeOpacity={0.78}
              >
                <PlayerAvatar
                  uri={player.avatarDataUrl}
                  name={player.name}
                  size={54}
                  borderColor="#10B981"
                />
                <View style={styles.guesserInfo}>
                  <Text style={styles.guesserName} numberOfLines={1}>
                    {player.name}
                  </Text>
                  <Text style={styles.guesserScore}>{player.score} pts</Text>
                </View>
                <View style={styles.awardBadge}>
                  <Text style={styles.awardBadgeText}>✓ +100</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sidebarFooter}>
            <Text style={styles.turnStreakText}>
              🔥 Words Drawn This Turn: {state.turnWordsCompleted}
            </Text>
            <TouchableOpacity
              onPress={onEndTurnEarly}
              style={styles.endTurnBtn}
            >
              <Text style={styles.endTurnBtnText}>End Turn Early</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Mid-Game Reconnect QR Code Modal */}
      <Modal
        visible={showQrModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Scan to Join / Reconnect</Text>
            <Text style={styles.modalUrl}>{serverUrl}</Text>
            <View style={styles.modalQrWrap}>
              <QRCode
                value={serverUrl || 'http://192.168.1.100:8080'}
                size={200}
                backgroundColor="#FFFFFF"
                color="#0F172A"
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowQrModal(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 14,
    gap: 10,
  },
  topHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  drawerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 170,
  },
  roundMini: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  drawerName: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '900',
  },
  secretWordCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#6366F1',
    gap: 12,
  },
  wordMetaCol: {
    gap: 2,
  },
  secretLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  categorySub: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '700',
  },
  secretWordText: {
    color: '#FDE047',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.6,
    textAlign: 'center',
    flex: 1,
  },
  skipBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569',
  },
  skipBtnText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  hudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerBox: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#38BDF8',
    minWidth: 96,
    alignItems: 'center',
  },
  timerBoxWarning: {
    borderColor: '#F59E0B',
  },
  timerBoxUrgent: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  timerText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
  },
  qrMiniBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
  },
  qrMiniBtnText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
  },
  awardToast: {
    backgroundColor: '#065F46',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  awardToastText: {
    color: '#ECFDF5',
    fontSize: 15,
    fontWeight: '900',
  },
  workspaceRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  canvasCol: {
    flex: 2.5,
  },
  guessersSidebar: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    marginBottom: 10,
  },
  sidebarTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '900',
  },
  sidebarHint: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  guessersScroll: {
    flex: 1,
  },
  guessersList: {
    gap: 9,
    paddingBottom: 10,
  },
  guesserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 10,
    borderWidth: 2,
    borderColor: '#10B981',
    gap: 10,
  },
  guesserInfo: {
    flex: 1,
  },
  guesserName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  guesserScore: {
    color: '#FDE047',
    fontSize: 13,
    fontWeight: '700',
  },
  awardBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  awardBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
    gap: 8,
  },
  turnStreakText: {
    color: '#FDE047',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  endTurnBtn: {
    backgroundColor: '#334155',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  endTurnBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
    gap: 10,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
  },
  modalUrl: {
    color: '#FDE047',
    fontSize: 15,
    fontWeight: '700',
  },
  modalQrWrap: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginVertical: 8,
  },
  modalCloseBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
