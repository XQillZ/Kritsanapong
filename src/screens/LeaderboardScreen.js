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
    { id: 'all', name: 'ทั้งหมด' },
    { id: 'vehicles', name: 'ยานพาหนะ' },
    { id: 'animals', name: 'สัตว์' },
    { id: 'musical_instruments', name: 'เครื่องดนตรี' },
  ];

  const difficulties = [
    { id: 'easy', name: 'ระดับง่าย' },
    { id: 'hard', name: 'ระดับยาก' },
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
           // support nested field names like `scores.vehicles_easy` vs `scores.easy`
           const fieldPath = scoreField.replace('scores.', '');
           displayScore = data.scores[fieldPath] || 0;
        }

        // Only show users who have a score > 0 for this category/difficulty
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

  const getRankStyle = (rank) => {
    if (rank === 1) return { backgroundColor: '#FFD700', color: '#2C3E50' };
    if (rank === 2) return { backgroundColor: '#C0C0C0', color: '#2C3E50' };
    if (rank === 3) return { backgroundColor: '#e99169', color: '#FFFFFF' };
    return { backgroundColor: '#ECF0F1', color: '#7F8C8D' };
  };

  const renderItem = ({ item }) => {
    const rankStyle = getRankStyle(item.rank);
    return (
      <View style={styles.leaderboardItem}>
        <View style={[styles.rankBadge, { backgroundColor: rankStyle.backgroundColor }]}> 
          <Text style={[styles.rankText, { color: rankStyle.color }]}> 
            {item.rank <= 3 ? '🏆' : item.rank}
          </Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.name}</Text>
          <Text style={styles.gamesText}>{item.games} เกม</Text>
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
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={styles.loadingTitle}>กำลังโหลดตารางคะแนน</Text>
            <Text style={styles.loadingText}>ระบบกำลังดึงข้อมูลคะแนนล่าสุดจากฐานข้อมูล</Text>
          </View>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scroll={false} accentColor={colors.gold} secondaryAccentColor={colors.accentSecondary}>
      <View style={styles.heroCard}>
        <Text style={styles.headerTitle}>🏆 ตารางคะแนน</Text>
        <Text style={styles.headerSubtitle}>จัดอันดับผู้เล่นตามคะแนนสะสมและคะแนนแยกตามโหมด</Text>
      </View>

      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>เลือกระดับความยาก</Text>
        <View style={styles.filterRow}>
          {difficulties.map((diff) => (
            <TouchableOpacity
              key={diff.id}
              style={[
                styles.filterChip,
                selectedDifficulty === diff.id && styles.filterChipActive,
                diff.id === 'easy' && selectedDifficulty === diff.id && { backgroundColor: colors.success, borderColor: colors.success },
                diff.id === 'hard' && selectedDifficulty === diff.id && { backgroundColor: colors.danger, borderColor: colors.danger }
              ]}
              onPress={() => {
                setSelectedDifficulty(diff.id);
              }}
              activeOpacity={0.9}
            >
              <Text style={[
                styles.filterChipText,
                selectedDifficulty === diff.id && styles.filterChipTextActive
              ]}>{diff.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterTitle}>เลือกหมวดหมู่</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterChip,
                selectedCategory === cat.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.9}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === cat.id && styles.filterChipTextActive
              ]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={leaderboard}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>ยังไม่มีข้อมูลคะแนนในตัวกรองนี้</Text>
            <Text style={styles.emptyText}>ลองเปลี่ยนหมวดหมู่หรือระดับความยากเพื่อดูข้อมูลเพิ่มเติม</Text>
          </View>
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
    justifyContent: 'center'
  },
  loadingCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    alignItems: 'center',
    ...shadows.card
  },
  loadingTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'center'
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center'
  },
  heroCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginTop: 8,
    marginBottom: 12,
    ...shadows.card
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 8
  },
  filterCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
    ...shadows.soft
  },
  filterTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10
  },
  filterScrollContent: {
    gap: 6,
    paddingRight: 4
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong
  },
  filterChipActive: {
    borderColor: colors.accentSecondary
  },
  categoryChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  filterChipText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700'
  },
  filterChipTextActive: {
    color: colors.white
  },
  list: {
    paddingBottom: 16,
    gap: 8
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    ...shadows.soft
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  rankText: {
    fontSize: 15,
    fontWeight: '800'
  },
  playerInfo: {
    flex: 1
  },
  playerName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text
  },
  gamesText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center'
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.accentSecondary
  },
  scoreLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyState: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    alignItems: 'center',
    marginTop: 4
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center'
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center'
  },
  homeButton: {
    backgroundColor: colors.surfaceStrong,
    marginBottom: 8,
    padding: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong
  },
  homeButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800'
  },
});
