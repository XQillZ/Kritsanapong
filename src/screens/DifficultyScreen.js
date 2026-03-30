import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function DifficultyScreen({ navigation, route }) {
  const { category } = route.params;

  const handleSelectDifficulty = (difficulty) => {
    navigation.navigate('Game', { category, difficulty });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      <View style={styles.header}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={styles.title}>เลือกระดับความยาก</Text>
        <Text style={styles.subtitle}>หมวดหมู่: {category.name}</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.difficultyCard, { backgroundColor: '#27AE60' }]}
          onPress={() => handleSelectDifficulty('easy')}
        >
          <Text style={styles.difficultyEmoji}>😊</Text>
          <Text style={styles.difficultyName}>ง่าย (Easy)</Text>
          <Text style={styles.difficultyDesc}>คำศัพท์พื้นฐาน คุ้นเคยในชีวิตประจำวัน</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.difficultyCard, { backgroundColor: '#E74C3C' }]}
          onPress={() => handleSelectDifficulty('hard')}
        >
          <Text style={styles.difficultyEmoji}>😈</Text>
          <Text style={styles.difficultyName}>ยาก (Hard)</Text>
          <Text style={styles.difficultyDesc}>คำศัพท์เฉพาะทางหรือชื่อที่จำยากขึ้น</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← กลับไปเลือกหมวดหมู่</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  emoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#F1C40F',
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  difficultyCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  difficultyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  difficultyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  difficultyDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: '#34495E',
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
