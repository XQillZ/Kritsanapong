import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView
} from 'react-native';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import ScreenShell from '../components/ScreenShell';
import { db } from '../services/firebase';
import { colors, radii, shadows } from '../theme/appTheme';

export default function LeaderboardScreen({ navigation }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');

  const categories = [
    { id: 'all', name: 'ทั้งหมด', emoji: '🌐' },
    { id: 'vehicles', name: 'ยานพาหนะ', emoji: '🚗' },
    { id: 'animals', name: 'สัตว์', emoji: '🐘' },
    { id: 'musical_instruments', name: 'เครื่องดนตรี', emoji: '🎸' },
  ];

  const difficulties = [
    { id: 'easy', name: 'โหมดง่าย', emoji: '🌱' },
    { id: 'hard', name: 'โหมดยาก', emoji: '🔥' },
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCategory, selectedDifficulty]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      
      let q;
      let scoreField = '';

      if (selectedDifficulty !== 'all' && selectedCategory !== 'all') {
        scoreField = `scores.${selectedCategory}_${selectedDifficulty}`;
        q = query(usersRef, orderBy(scoreField, 'desc'), limit(50));
      } else if (selectedDifficulty !== 'all') {
        scoreField = `scores.${selectedDifficulty}`;
        q = query(usersRef, orderBy(scoreField, 'desc'), limit(50));
      } else if (selectedCategory !== 'all') {
        scoreField = `scores.${selectedCategory}`;
        q = query(usersRef, orderBy(scoreField, 'desc'), limit(50));
      } else {
        scoreField = 'totalScore';
        q = query(usersRef, orderBy(scoreField, 'desc'), limit(50));
      }
      
      const querySnapshot = await getDocs(q);
      
      const leaderboardData = [];
      let currentRank = 1;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let displayScore = 0;
        
        if (scoreField === 'totalScore') {
          displayScore = data.totalScore || 0;
        } else if (data.scores) {
           const fieldPath = scoreField.replace('scores.', '');
           displayScore = data.scores[fieldPath] || 0;
        }

        if (displayScore > 0 || (selectedCategory === 'all' && selectedDifficulty === 'all')) {
          leaderboardData.push({
            id: doc.id,
            rank: currentRank++,
            name: data.username || data.email?.split('@')[0] || 'Unknown User',
            games: data.gamesPlayed || 0,
            score: displayScore,
          });
        }
      });
      
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLeaderboard();
  }, []);

  const renderPodium = () => {
    if (leaderboard.length === 0) return null;

    const rank1 = leaderboard[0];
    const rank2 = leaderboard[1];
    const rank3 = leaderboard[2];

    return (
      <View style={styles.podiumCard}>
        <View style={styles.podiumTopSheen} />
        <View style={styles.podiumHeaderBadge}>
          <Text style={styles.podiumHeaderBadgeText}>👑 TOP 3 CHAMPIONS</Text>
        </View>

        <View style={styles.podiumContainer}>
          {/* Rank 2 - Silver (Left) */}
          <View style={[styles.podiumCol, styles.podiumCol2]}>
            {rank2 ? (
              <>
                <View style={[styles.podiumAvatarWrap, styles.podiumAvatarWrap2]}>
                  <Text style={styles.podiumBadgeEmoji}>🥈</Text>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{rank2.name}</Text>
                <Text style={styles.podiumScore2}>{rank2.score} pts</Text>
                <View style={styles.podiumGamesBadge}>
                  <Text style={styles.podiumGamesText}>🎮 {rank2.games} รอบ</Text>
                </View>
                <View style={[styles.podiumBlock, styles.podiumBlock2]}>
                  <Text style={styles.podiumRankNum}>2</Text>
                  <Text style={styles.podiumTierLabel}>SILVER</Text>
                </View>
              </>
            ) : (
              <View style={styles.podiumEmptyPlace}>
                <Text style={styles.podiumEmptyText}>-</Text>
              </View>
            )}
          </View>

          {/* Rank 1 - Gold (Center) */}
          <View style={[styles.podiumCol, styles.podiumCol1]}>
            {rank1 ? (
              <>
                <Text style={styles.crownEmoji}>👑</Text>
                <View style={[styles.podiumAvatarWrap, styles.podiumAvatarWrap1]}>
                  <Text style={styles.podiumBadgeEmoji}>🥇</Text>
                </View>
                <Text style={[styles.podiumName, styles.podiumName1]} numberOfLines={1}>{rank1.name}</Text>
                <View style={styles.goldScoreBadge}>
                  <Text style={styles.podiumScore1}>⭐ {rank1.score} pts</Text>
                </View>
                <View style={[styles.podiumGamesBadge, styles.podiumGamesBadgeGold]}>
                  <Text style={[styles.podiumGamesText, styles.podiumGamesTextGold]}>🎮 เล่นไป {rank1.games} รอบ</Text>
                </View>
                <View style={[styles.podiumBlock, styles.podiumBlock1]}>
                  <Text style={styles.podiumRankNum1}>1</Text>
                  <Text style={styles.podiumTierLabel1}>CHAMPION</Text>
                </View>
              </>
            ) : (
              <View style={styles.podiumEmptyPlace}>
                <Text style={styles.podiumEmptyText}>-</Text>
              </View>
            )}
          </View>

          {/* Rank 3 - Bronze (Right) */}
          <View style={[styles.podiumCol, styles.podiumCol3]}>
            {rank3 ? (
              <>
                <View style={[styles.podiumAvatarWrap, styles.podiumAvatarWrap3]}>
                  <Text style={styles.podiumBadgeEmoji}>🥉</Text>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{rank3.name}</Text>
                <Text style={styles.podiumScore3}>{rank3.score} pts</Text>
                <View style={styles.podiumGamesBadge}>
                  <Text style={styles.podiumGamesText}>🎮 {rank3.games} รอบ</Text>
                </View>
                <View style={[styles.podiumBlock, styles.podiumBlock3]}>
                  <Text style={styles.podiumRankNum}>3</Text>
                  <Text style={styles.podiumTierLabel}>BRONZE</Text>
                </View>
              </>
            ) : (
              <View style={styles.podiumEmptyPlace}>
                <Text style={styles.podiumEmptyText}>-</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.leaderboardItem}>
        <View style={styles.rankBadge}> 
          <Text style={styles.rankText}>#{item.rank < 10 ? `0${item.rank}` : item.rank}</Text>
        </View>
        <View style={styles.playerAvatarSmall}>
          <Text style={styles.playerAvatarSmallEmoji}>👤</Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.name}</Text>
          <View style={styles.gamesBadgeRow}>
            <Text style={styles.gamesText}>🎮 เล่นไปแล้ว {item.games} รอบ</Text>
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{item.score}</Text>
          <Text style={styles.scoreLabel}>คะแนน</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenShell scroll={false} accentColor={colors.gold} secondaryAccentColor={colors.accentSecondary}>
        <View style={styles.loadingWrap}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#FBBF24" />
            <Text style={styles.loadingTitle}>กำลังโหลดตารางคะแนน</Text>
            <Text style={styles.loadingText}>ระบบกำลังดึงข้อมูลคะแนนล่าสุดจากฐานข้อมูล</Text>
          </View>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scroll={false} accentColor={colors.gold} secondaryAccentColor={colors.accentSecondary}>
      {/* Epic Header Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroGlowSheen} />
        <Text style={styles.headerTitle}>🏆 ตารางคะแนนยอดฝีมือ</Text>
        <Text style={styles.headerSubtitle}>จัดอันดับผู้เล่นที่ทำคะแนนสูงสุด และสถิติการแข่งขัน</Text>
      </View>

      {/* Cyber Filters Card */}
      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>⚙️ เลือกระดับความยาก</Text>
        <View style={styles.filterRow}>
          {difficulties.map((diff) => (
            <TouchableOpacity
              key={diff.id}
              style={[
                styles.filterChip,
                selectedDifficulty === diff.id && styles.filterChipActive,
                diff.id === 'easy' && selectedDifficulty === diff.id && styles.filterEasyActive,
                diff.id === 'hard' && selectedDifficulty === diff.id && styles.filterHardActive
              ]}
              onPress={() => setSelectedDifficulty(diff.id)}
              activeOpacity={0.88}
            >
              <Text style={[
                styles.filterChipText,
                selectedDifficulty === diff.id && styles.filterChipTextActive
              ]}>{diff.emoji} {diff.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterTitle}>🎯 เลือกหมวดหมู่คำถาม</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterChip,
                selectedCategory === cat.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.88}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === cat.id && styles.filterChipTextActive
              ]}>{cat.emoji} {cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={leaderboard.length > 3 ? leaderboard.slice(3) : []}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderPodium}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          leaderboard.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>ยังไม่มีข้อมูลคะแนนในตัวกรองนี้</Text>
              <Text style={styles.emptyText}>ลองเปลี่ยนหมวดหมู่หรือระดับความยากเพื่อดูข้อมูลเพิ่มเติม</Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity 
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.9}
      >
        <Text style={styles.homeButtonText}>กลับหน้าหลัก</Text>
      </TouchableOpacity>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 16
  },
  loadingCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    padding: 24,
    alignItems: 'center',
    ...shadows.card
  },
  loadingTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'center'
  },
  loadingText: {
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center'
  },
  heroCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.45)',
    padding: 16,
    marginTop: 6,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card
  },
  heroGlowSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(251, 191, 36, 0.75)'
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  heroBadgeText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#D1D5DB',
    lineHeight: 18,
    fontWeight: '500'
  },
  filterCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
    ...shadows.soft
  },
  filterTitle: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  filterScrollContent: {
    gap: 8,
    paddingRight: 4
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  filterChipActive: {
    borderColor: colors.accentSecondary
  },
  filterEasyActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981'
  },
  filterHardActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444'
  },
  categoryChipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderColor: '#818CF8'
  },
  filterChipText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700'
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '800'
  },
  podiumCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card
  },
  podiumTopSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(251, 191, 36, 0.5)'
  },
  podiumHeaderBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10
  },
  podiumHeaderBadgeText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 4,
    paddingHorizontal: 4
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 4
  },
  podiumCol1: {
    zIndex: 3
  },
  podiumCol2: {
    zIndex: 2
  },
  podiumCol3: {
    zIndex: 1
  },
  crownEmoji: {
    fontSize: 24,
    marginBottom: -4
  },
  podiumAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 6
  },
  podiumAvatarWrap1: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderColor: '#FBBF24',
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5
  },
  podiumAvatarWrap2: {
    borderColor: '#94A3B8',
    backgroundColor: 'rgba(148, 163, 184, 0.2)'
  },
  podiumAvatarWrap3: {
    borderColor: '#D97706',
    backgroundColor: 'rgba(217, 119, 6, 0.2)'
  },
  podiumBadgeEmoji: {
    fontSize: 22
  },
  podiumName: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    marginBottom: 2
  },
  podiumName1: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.white
  },
  goldScoreBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginBottom: 6
  },
  podiumScore1: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '900'
  },
  podiumScore2: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 3
  },
  podiumScore3: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 3
  },
  podiumGamesBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 6
  },
  podiumGamesBadgeGold: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderColor: 'rgba(245, 158, 11, 0.4)'
  },
  podiumGamesText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D1D5DB'
  },
  podiumGamesTextGold: {
    color: '#FDE68A',
    fontWeight: '900'
  },
  gamesBadgeRow: {
    marginTop: 2
  },
  podiumBlock: {
    width: '100%',
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    paddingVertical: 6
  },
  podiumBlock1: {
    height: 105,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: '#FBBF24'
  },
  podiumBlock2: {
    height: 80,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderColor: '#94A3B8'
  },
  podiumBlock3: {
    height: 60,
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderColor: '#D97706'
  },
  podiumRankNum: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.white
  },
  podiumRankNum1: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FBBF24'
  },
  podiumTierLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginTop: 2
  },
  podiumTierLabel1: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FDE68A',
    letterSpacing: 0.8,
    marginTop: 2
  },
  podiumEmptyPlace: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  podiumEmptyText: {
    color: colors.textMuted,
    fontSize: 16
  },
  list: {
    paddingBottom: 16,
    gap: 8
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    ...shadows.soft
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  rankText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#E5E7EB'
  },
  playerAvatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  playerAvatarSmallEmoji: {
    fontSize: 16
  },
  playerInfo: {
    flex: 1
  },
  playerName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 2
  },
  gamesText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600'
  },
  scoreContainer: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FBBF24'
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FDE68A'
  },
  emptyState: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    marginTop: 4
  },
  emptyEmoji: {
    fontSize: 34,
    marginBottom: 8
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center'
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center'
  },
  homeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 6,
    padding: 13,
    borderRadius: radii.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  homeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800'
  }
});
