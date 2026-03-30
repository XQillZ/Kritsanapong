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
import { db } from '../services/firebase';

const MOCK_LEADERBOARD = [
   
];

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
    if (rank === 3) return { backgroundColor: '#CD7F32', color: '#FFFFFF' };
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
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 ตารางคะแนน</Text>
        <Text style={styles.headerSubtitle}>ผู้เล่นที่ทำคะแนนสูงสุด</Text>
      </View>

      <View style={styles.categoryContainer}>
        {difficulties.map((diff) => (
          <TouchableOpacity
            key={diff.id}
            style={[
              styles.categoryButton,
              selectedDifficulty === diff.id && styles.categoryButtonActive,
              diff.id === 'easy' && selectedDifficulty === diff.id && { backgroundColor: '#27AE60', borderColor: '#27AE60' },
              diff.id === 'hard' && selectedDifficulty === diff.id && { backgroundColor: '#E74C3C', borderColor: '#E74C3C' }
            ]}
            onPress={() => {
              setSelectedDifficulty(diff.id);
            }}
          >
            <Text style={[
              styles.categoryText,
              selectedDifficulty === diff.id && styles.categoryTextActive
            ]}>{diff.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.categoryContainer}>
        <Text style={styles.subLabel}>หรือเลือกตามหมวดหมู่:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategory === cat.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextActive
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity 
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.homeButtonText}>กลับหน้าหลัก</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2C3E50',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 4,
  },
  categoryContainer: {
    padding: 16,
    paddingBottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subLabel: {
    width: '100%',
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  categoryText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  gamesText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  homeButton: {
    backgroundColor: '#34495E',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
