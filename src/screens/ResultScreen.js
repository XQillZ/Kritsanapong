import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView
} from 'react-native';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export default function ResultScreen({ navigation, route }) {
  const { score, total, answeredQuestions, category, difficulty } = route.params;
  const wrongCount = total - score;
  const percentage = Math.round((score / total) * 100);
  
  // คำนวณคะแนนใหม่โดยคำนึงถึงการใช้คำใบ้
  let finalScore = 0;

  if (difficulty === 'hard') {
    // โหมดยาก: วนลูปเช็คว่าข้อไหนถูก และใช้คำใบ้ไหม
    answeredQuestions.forEach(q => {
      if (q.correct) {
        finalScore += q.usedHint ? 1 : 2;
      }
    });
  } else {
    finalScore = score;
  }

  useEffect(() => {
    const saveScore = async () => {
      if (auth.currentUser && finalScore > 0) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          
          // กำหนดฟิลด์คะแนนแยกตามหมวดหมู่และระดับความยาก
          const categoryScoreField = `scores.${category.id}`;
          const difficultyScoreField = `scores.${difficulty}`;
          const combinedScoreField = `scores.${category.id}_${difficulty}`;
          
          await updateDoc(userRef, {
            totalScore: increment(finalScore),
            [categoryScoreField]: increment(finalScore),
            [difficultyScoreField]: increment(finalScore),
            [combinedScoreField]: increment(finalScore),
            gamesPlayed: increment(1)
          });
        } catch (error) {
          console.error('Error saving score:', error);
        }
      }
    };
    
    saveScore();
  }, []);

  const getMessage = () => {
    if (percentage === 100) return { text: 'สมบูรณ์แบบ!', emoji: '🏆', color: '#27AE60' };
    if (percentage >= 80) return { text: 'ยอดเยี่ยม!', emoji: '🌟', color: '#27AE60' };
    if (percentage >= 60) return { text: 'ดีมาก!', emoji: '👍', color: '#F39C12' };
    if (percentage >= 40) return { text: 'พยายามอีกครั้ง!', emoji: '💪', color: '#E67E22' };
    return { text: 'ฝึกซ้อมเพิ่ม!', emoji: '📚', color: '#E74C3C' };
  };

  const message = getMessage();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{message.emoji}</Text>
          <Text style={[styles.message, { color: message.color }]}>
            {message.text}
          </Text>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>ตอบถูก</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreTotal}>/{total}</Text>
          </View>
          <Text style={styles.percentage}>{percentage}%</Text>
          
          <View style={styles.finalScoreContainer}>
            {difficulty === 'hard' && (
              <Text style={styles.bonusText}>🔥 โหมดยาก: ข้อละ 2 คะแนน (ใช้คำใบ้เหลือ 1)</Text>
            )}
            <Text style={styles.finalScoreText}>คะแนนที่ได้รับ: +{finalScore}</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={[styles.stat, { backgroundColor: '#27AE60' }]}>
            <Text style={styles.statNumber}>{score}</Text>
            <Text style={styles.statLabel}>ถูก</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: '#E74C3C' }]}>
            <Text style={styles.statNumber}>{wrongCount}</Text>
            <Text style={styles.statLabel}>ผิด</Text>
          </View>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>สรุปคำตอบ</Text>
          {answeredQuestions.map((item, index) => (
            <View key={index} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewHeaderLeft}>
                  <Text style={styles.reviewNumber}>ข้อ {index + 1}</Text>
                  {item.usedHint && <Text style={styles.usedHintBadge}>💡 ใช้คำใบ้</Text>}
                </View>
                <Text style={styles.reviewResult}>
                  {item.correct ? '✅ ถูก' : '❌ ผิด'}
                </Text>
              </View>
              <Text style={styles.reviewAnswer}>
                คำตอบที่ถูก: {item.question.answer}
              </Text>
              <Text style={styles.reviewUserAnswer}>
                คำตอบของคุณ: {item.userAnswer}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: category.color }]}
            onPress={() => navigation.navigate('Game', { category, difficulty })}
          >
            <Text style={styles.buttonText}>เล่นอีกครั้ง</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#F39C12' }]}
            onPress={() => navigation.navigate('Difficulty', { category })}
          >
            <Text style={styles.buttonText}>เปลี่ยนความยาก</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#34495E' }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>กลับหน้าหลัก</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 8,
  },
  message: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 18,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  scoreTotal: {
    fontSize: 36,
    color: '#95A5A6',
  },
  percentage: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8,
  },
  finalScoreContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    width: '100%',
  },
  bonusText: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  finalScoreText: {
    fontSize: 20,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  statsCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  reviewSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usedHintBadge: {
    fontSize: 12,
    backgroundColor: '#FFF9C4',
    color: '#F39C12',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  reviewNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  reviewResult: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewAnswer: {
    fontSize: 14,
    color: '#27AE60',
    marginBottom: 4,
  },
  reviewUserAnswer: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
