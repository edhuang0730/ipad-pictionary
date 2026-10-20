import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { HostGameState } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';

interface IntermissionScreenProps {
  state: HostGameState;
  onStartTurnNow: () => void;
  onEndGameEarly: () => void;
}

export const IntermissionScreen: React.FC<IntermissionScreenProps> = ({
  state,
  onStartTurnNow,
  onEndGameEarly,
}) => {
  const nextDrawer =
    state.players[state.currentDrawerIndex] ?? state.players[0];
  const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.roundBadge}>
          <Text style={styles.roundBadgeText}>
            ROUND {state.currentRound} OF {state.settings.totalRounds} • TURN{' '}
            {state.currentDrawerIndex + 1} OF {state.players.length}
          </Text>
        </View>

        {state.revealedWord ? (
          <View style={styles.revealedPill}>
            <Text style={styles.revealedLabel}>Previous Word: </Text>
            <Text style={styles.revealedWordText}>{state.revealedWord}</Text>
          </View>
        ) : null}

        <TouchableOpacity onPress={onEndGameEarly} style={styles.quitBtn}>
          <Text style={styles.quitBtnText}>End Game</Text>
        </TouchableOpacity>
      </View>

      {/* Main Split Content */}
      <View style={styles.mainRow}>
        {/* Left: Pass the iPad Announcement + 10s Countdown */}
        <View style={styles.announcementCard}>
          <Text style={styles.passLabel}>GET READY! PASS THE IPAD TO:</Text>

          {nextDrawer && (
            <View style={styles.drawerShowcase}>
              <PlayerAvatar
                uri={nextDrawer.avatarDataUrl}
                name={nextDrawer.name}
                size={128}
                borderColor="#FDE047"
              />
              <Text style={styles.drawerName}>{nextDrawer.name}</Text>
              <Text style={styles.drawerHint}>
                Everyone else: watch your phone screens & shout out your guesses!
              </Text>
            </View>
          )}

          <View style={styles.countdownWrap}>
            <Text style={styles.countdownSub}>NEXT TURN STARTS IN</Text>
            <View style={styles.countdownCircle}>
              <Text style={styles.countdownNumber}>
                {state.intermissionTimeRemaining}
              </Text>
              <Text style={styles.countdownUnit}>sec</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onStartTurnNow}
            style={styles.readyNowBtn}
          >
            <Text style={styles.readyNowBtnText}>
              🎨 I Have the iPad — Start Drawing Now!
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right: Live Leaderboard Standings */}
        <View style={styles.scoreboardCard}>
          <Text style={styles.scoreboardTitle}>🏆 Live Standings</Text>
          <ScrollView contentContainerStyle={styles.scoreList}>
            {sortedPlayers.map((p, idx) => {
              const isNextDrawer = nextDrawer && p.id === nextDrawer.id;
              return (
                <View
                  key={p.id}
                  style={[
                    styles.scoreRow,
                    isNextDrawer && styles.scoreRowHighlight,
                  ]}
                >
                  <Text style={styles.rankText}>#{idx + 1}</Text>
                  <PlayerAvatar
                    uri={p.avatarDataUrl}
                    name={p.name}
                    size={46}
                    borderColor={isNextDrawer ? '#FDE047' : '#818CF8'}
                  />
                  <View style={styles.scoreInfo}>
                    <Text style={styles.scoreName} numberOfLines={1}>
                      {p.name} {isNextDrawer ? '🎨' : ''}
                    </Text>
                    <Text style={styles.scoreStats}>
                      {p.wordsGuessed} guessed • {p.wordsDrawnSuccess} drawn
                    </Text>
                  </View>
                  <Text style={styles.scorePoints}>{p.score} pts</Text>
                </View>
              );
            })}
          </ScrollView>
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
  topBar: {
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
  roundBadge: {
    backgroundColor: '#312E81',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  roundBadgeText: {
    color: '#E0E7FF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  revealedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569',
  },
  revealedLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  revealedWordText: {
    color: '#FDE047',
    fontSize: 15,
    fontWeight: '900',
  },
  quitBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  quitBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  announcementCard: {
    flex: 1.3,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passLabel: {
    color: '#818CF8',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  drawerShowcase: {
    alignItems: 'center',
    gap: 10,
  },
  drawerName: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  drawerHint: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 420,
  },
  countdownWrap: {
    alignItems: 'center',
    gap: 8,
  },
  countdownSub: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  countdownCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#0F172A',
    borderWidth: 4,
    borderColor: '#FDE047',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    color: '#FDE047',
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 48,
  },
  countdownUnit: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  readyNowBtn: {
    width: '100%',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyNowBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  scoreboardCard: {
    flex: 0.9,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  scoreboardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  scoreList: {
    gap: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  scoreRowHighlight: {
    borderColor: '#FDE047',
    backgroundColor: 'rgba(253, 224, 71, 0.08)',
  },
  rankText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '900',
    width: 28,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  scoreStats: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  scorePoints: {
    color: '#FDE047',
    fontSize: 17,
    fontWeight: '900',
  },
});
