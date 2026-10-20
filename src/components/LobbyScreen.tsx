import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  GameSettings,
  Player,
  WordCategory,
  WordDifficulty,
} from '../types/game';
import { WORD_CATEGORIES, WORD_DIFFICULTIES } from '../data/words';
import { ServerStatus } from '../server/EmbeddedServer';
import { PlayerAvatar } from './PlayerAvatar';

interface LobbyScreenProps {
  players: Player[];
  settings: GameSettings;
  serverStatus: ServerStatus;
  isMuted: boolean;
  onToggleMute: () => void;
  onUpdateSettings: (partial: Partial<GameSettings>) => void;
  onRemovePlayer: (playerId: string) => void;
  onAddDemoPlayer: () => void;
  onStartGame: () => void;
}

const TURN_DURATION_OPTIONS = [30, 45, 60, 90, 120];
const ROUND_OPTIONS = [1, 2, 3, 4, 5];

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  players,
  settings,
  serverStatus,
  isMuted,
  onToggleMute,
  onUpdateSettings,
  onRemovePlayer,
  onAddDemoPlayer,
  onStartGame,
}) => {
  const canStart = players.length >= 2;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.logoEmoji}>🎨</Text>
          <View>
            <Text style={styles.title}>PICTIONARY PARTY</Text>
            <Text style={styles.subtitle}>
              Draw on the iPad • Watch Live on Phones • Shout Out Answers!
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View
            style={[
              styles.serverBadge,
              serverStatus.running
                ? styles.serverBadgeOnline
                : styles.serverBadgeOffline,
            ]}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: serverStatus.running ? '#10B981' : '#F59E0B',
                },
              ]}
            />
            <Text style={styles.serverBadgeText}>
              {serverStatus.running
                ? `Server Online: ${serverStatus.url}`
                : `Server Starting (${serverStatus.url})`}
            </Text>
          </View>

          <TouchableOpacity onPress={onToggleMute} style={styles.muteBtn}>
            <Text style={styles.muteBtnText}>
              {isMuted ? '🔇 Muted' : '🔊 Sound ON'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Split Content */}
      <View style={styles.mainRow}>
        {/* LEFT COLUMN: QR Code + Game Settings */}
        <ScrollView
          style={styles.leftCol}
          contentContainerStyle={styles.leftColContent}
        >
          {/* QR Code Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📱 Scan to Join on Phone</Text>
            <Text style={styles.sectionHint}>
              Open your phone camera, scan the QR code, snap a selfie & enter
              your name!
            </Text>

            <View style={styles.qrRow}>
              <View style={styles.qrBox}>
                <QRCode
                  value={serverStatus.url || 'http://192.168.1.100:8080'}
                  size={156}
                  backgroundColor="#FFFFFF"
                  color="#0F172A"
                />
              </View>

              <View style={styles.qrInfo}>
                <Text style={styles.urlLabel}>OR TYPE IN BROWSER:</Text>
                <View style={styles.urlPill}>
                  <Text style={styles.urlText}>{serverStatus.url}</Text>
                </View>
                <Text style={styles.stepItem}>1️⃣ Connect to the same Wi-Fi</Text>
                <Text style={styles.stepItem}>2️⃣ Take a selfie for your avatar</Text>
                <Text style={styles.stepItem}>
                  3️⃣ Screen auto-locks to Fullscreen!
                </Text>
              </View>
            </View>
          </View>

          {/* Game Settings Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>⚙️ Game Settings</Text>

            {/* Turn Timer */}
            <Text style={styles.settingLabel}>
              Drawing Time per Turn ({settings.turnDurationSec}s)
            </Text>
            <View style={styles.chipRow}>
              {TURN_DURATION_OPTIONS.map((sec) => {
                const active = settings.turnDurationSec === sec;
                return (
                  <TouchableOpacity
                    key={sec}
                    onPress={() => onUpdateSettings({ turnDurationSec: sec })}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {sec}s
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Total Rounds */}
            <Text style={styles.settingLabel}>
              Rounds per Player ({settings.totalRounds}{' '}
              {settings.totalRounds === 1 ? 'Round' : 'Rounds'})
            </Text>
            <View style={styles.chipRow}>
              {ROUND_OPTIONS.map((r) => {
                const active = settings.totalRounds === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => onUpdateSettings({ totalRounds: r })}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {r} {r === 1 ? 'Round' : 'Rounds'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Word Category */}
            <Text style={styles.settingLabel}>Word Category</Text>
            <View style={styles.chipRow}>
              {WORD_CATEGORIES.map((cat: WordCategory) => {
                const active = settings.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => onUpdateSettings({ category: cat })}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Difficulty */}
            <Text style={styles.settingLabel}>Word Difficulty</Text>
            <View style={styles.chipRow}>
              {WORD_DIFFICULTIES.map((diff: WordDifficulty) => {
                const active = settings.difficulty === diff;
                return (
                  <TouchableOpacity
                    key={diff}
                    onPress={() => onUpdateSettings({ difficulty: diff })}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {diff}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* RIGHT COLUMN: Connected Players & Start Button */}
        <View style={styles.rightCol}>
          <View style={styles.playersHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                👥 Connected Players ({players.length})
              </Text>
              <Text style={styles.sectionHint}>
                Minimum 2 players required to start
              </Text>
            </View>

            <TouchableOpacity
              onPress={onAddDemoPlayer}
              style={styles.demoPlayerBtn}
            >
              <Text style={styles.demoPlayerBtnText}>+ Add Local Player</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.playersScroll}
            contentContainerStyle={styles.playersGrid}
          >
            {players.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>🤳</Text>
                <Text style={styles.emptyTitle}>Waiting for Players...</Text>
                <Text style={styles.emptySub}>
                  Scan the QR code with your phones or tap "+ Add Local Player"
                  above to add players directly on the iPad.
                </Text>
              </View>
            ) : (
              players.map((p, index) => (
                <View key={p.id} style={styles.playerCard}>
                  <PlayerAvatar
                    uri={p.avatarDataUrl}
                    name={p.name}
                    size={62}
                    borderColor={p.connected ? '#818CF8' : '#64748B'}
                  />
                  <View style={styles.playerCardInfo}>
                    <Text style={styles.playerOrderBadge}>
                      DRAWER #{index + 1}
                    </Text>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text
                      style={[
                        styles.playerStatus,
                        { color: p.connected ? '#34D399' : '#94A3B8' },
                      ]}
                    >
                      {p.connected ? '● Ready' : '○ Offline'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onRemovePlayer(p.id)}
                    style={styles.removeBtn}
                  >
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            disabled={!canStart}
            onPress={onStartGame}
            style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
          >
            <Text style={styles.startBtnText}>
              {canStart
                ? `🚀 Start Game (${players.length} Players • ${settings.totalRounds} Rounds)`
                : `Waiting for ${Math.max(0, 2 - players.length)} More Player(s)...`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoEmoji: {
    fontSize: 32,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  serverBadgeOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#10B981',
  },
  serverBadgeOffline: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: '#F59E0B',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  serverBadgeText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  muteBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569',
  },
  muteBtnText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  leftCol: {
    flex: 1.05,
  },
  leftColContent: {
    gap: 14,
    paddingBottom: 12,
  },
  rightCol: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  sectionHint: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 14,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
  },
  qrInfo: {
    flex: 1,
    gap: 6,
  },
  urlLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  urlPill: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  urlText: {
    color: '#FDE047',
    fontSize: 16,
    fontWeight: '900',
  },
  stepItem: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
  settingLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  chip: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  chipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#818CF8',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  playersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  demoPlayerBtn: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  demoPlayerBtnText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  playersScroll: {
    flex: 1,
  },
  playersGrid: {
    gap: 10,
    paddingBottom: 12,
  },
  emptyBox: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  playerCardInfo: {
    flex: 1,
  },
  playerOrderBadge: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  playerName: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  playerStatus: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
  },
  startBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  startBtnDisabled: {
    backgroundColor: '#334155',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
});
