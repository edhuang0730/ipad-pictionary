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

interface GameOverScreenProps {
  state: HostGameState;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  state,
  onPlayAgain,
  onReturnToLobby,
}) => {
  const ranked = [...state.players].sort((a, b) => b.score - a.score);
  const first = ranked[0];
  const second = ranked[1];
  const third = ranked[2];

  const topGuesser = [...state.players].sort(
    (a, b) => b.wordsGuessed - a.wordsGuessed
  )[0];
  const topArtist = [...state.players].sort(
    (a, b) => b.wordsDrawnSuccess - a.wordsDrawnSuccess
  )[0];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 FINAL RESULTS 🏆</Text>
        <Text style={styles.headerSub}>
          Completed {state.settings.totalRounds} Rounds!
        </Text>
      </View>

      {/* Main Split */}
      <View style={styles.mainRow}>
        {/* Left: Podium + MVP Awards */}
        <View style={styles.podiumCard}>
          <View style={styles.podiumStage}>
            {/* 2nd Place */}
            {second && (
              <View style={styles.podiumColumn}>
                <PlayerAvatar
                  uri={second.avatarDataUrl}
                  name={second.name}
                  size={78}
                  borderColor="#CBD5E1"
                />
                <Text style={styles.podiumName} numberOfLines={1}>
                  {second.name}
                </Text>
                <Text style={styles.podiumScore}>{second.score} pts</Text>
                <View style={[styles.pillar, styles.pillarSecond]}>
                  <Text style={styles.pillarRank}>🥈 2nd</Text>
                </View>
              </View>
            )}

            {/* 1st Place */}
            {first && (
              <View style={styles.podiumColumn}>
                <Text style={styles.crownEmoji}>👑</Text>
                <PlayerAvatar
                  uri={first.avatarDataUrl}
                  name={first.name}
                  size={104}
                  borderColor="#FDE047"
                />
                <Text
                  style={[styles.podiumName, { fontSize: 22, color: '#FDE047' }]}
                  numberOfLines={1}
                >
                  {first.name}
                </Text>
                <Text style={[styles.podiumScore, { fontSize: 18 }]}>
                  {first.score} pts
                </Text>
                <View style={[styles.pillar, styles.pillarFirst]}>
                  <Text style={styles.pillarRank}>🥇 1st</Text>
                </View>
              </View>
            )}

            {/* 3rd Place */}
            {third && (
              <View style={styles.podiumColumn}>
                <PlayerAvatar
                  uri={third.avatarDataUrl}
                  name={third.name}
                  size={70}
                  borderColor="#D97706"
                />
                <Text style={styles.podiumName} numberOfLines={1}>
                  {third.name}
                </Text>
                <Text style={styles.podiumScore}>{third.score} pts</Text>
                <View style={[styles.pillar, styles.pillarThird]}>
                  <Text style={styles.pillarRank}>🥉 3rd</Text>
                </View>
              </View>
            )}
          </View>

          {/* MVP Badges */}
          <View style={styles.mvpRow}>
            {topGuesser && (
              <View style={styles.mvpCard}>
                <Text style={styles.mvpLabel}>⚡ SHARPEST GUESSER</Text>
                <Text style={styles.mvpPlayer}>{topGuesser.name}</Text>
                <Text style={styles.mvpStat}>
                  {topGuesser.wordsGuessed} words guessed
                </Text>
              </View>
            )}
            {topArtist && (
              <View style={styles.mvpCard}>
                <Text style={styles.mvpLabel}>🎨 MASTER ARTIST</Text>
                <Text style={styles.mvpPlayer}>{topArtist.name}</Text>
                <Text style={styles.mvpStat}>
                  {topArtist.wordsDrawnSuccess} drawings solved
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Right: Full Scoreboard & Actions */}
        <View style={styles.rightCol}>
          <Text style={styles.sectionTitle}>📊 Full Leaderboard</Text>
          <ScrollView
            style={styles.boardScroll}
            contentContainerStyle={styles.boardList}
          >
            {ranked.map((p, idx) => (
              <View key={p.id} style={styles.boardRow}>
                <Text style={styles.boardRank}>#{idx + 1}</Text>
                <PlayerAvatar
                  uri={p.avatarDataUrl}
                  name={p.name}
                  size={44}
                  borderColor={idx === 0 ? '#FDE047' : '#818CF8'}
                />
                <View style={styles.boardInfo}>
                  <Text style={styles.boardName}>{p.name}</Text>
                  <Text style={styles.boardSub}>
                    {p.wordsGuessed} guessed • {p.wordsDrawnSuccess} drawn
                  </Text>
                </View>
                <Text style={styles.boardScore}>{p.score} pts</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={onPlayAgain} style={styles.playAgainBtn}>
              <Text style={styles.playAgainText}>
                🔄 Play Again (Same Players)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onReturnToLobby}
              style={styles.lobbyBtn}
            >
              <Text style={styles.lobbyBtnText}>🏠 Back to Lobby</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerTitle: {
    color: '#FDE047',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  podiumCard: {
    flex: 1.35,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'space-between',
  },
  podiumStage: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 14,
  },
  podiumColumn: {
    alignItems: 'center',
    width: 140,
  },
  crownEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  podiumName: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 8,
  },
  podiumScore: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  pillar: {
    width: '100%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarFirst: {
    height: 110,
    backgroundColor: '#4F46E5',
    borderWidth: 2,
    borderColor: '#FDE047',
  },
  pillarSecond: {
    height: 80,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  pillarThird: {
    height: 60,
    backgroundColor: '#451A03',
    borderWidth: 1,
    borderColor: '#D97706',
  },
  pillarRank: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  mvpRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mvpCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  mvpLabel: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  mvpPlayer: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '900',
    marginVertical: 2,
  },
  mvpStat: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  rightCol: {
    flex: 0.95,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  boardScroll: {
    flex: 1,
  },
  boardList: {
    gap: 8,
    paddingBottom: 12,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  boardRank: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '900',
    width: 28,
  },
  boardInfo: {
    flex: 1,
  },
  boardName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  boardSub: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  boardScore: {
    color: '#FDE047',
    fontSize: 17,
    fontWeight: '900',
  },
  actionButtons: {
    gap: 10,
    marginTop: 10,
  },
  playAgainBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  playAgainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  lobbyBtn: {
    backgroundColor: '#334155',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  lobbyBtnText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
});
