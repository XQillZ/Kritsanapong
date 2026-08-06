import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { doc, updateDoc, increment } from 'firebase/firestore';
import ScreenShell from '../components/ScreenShell';
import { auth, db } from '../services/firebase';
import { colors, difficultyMeta, radii, shadows } from '../theme/appTheme';
import { getQuestionPrompt } from '../utils/questionPrompt';

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
  const difficultyInfo = difficultyMeta[difficulty];

  return (
    <ScreenShell accentColor={category.color} secondaryAccentColor={difficultyInfo?.accent || colors.accentSecondary}>
      <View style={styles.heroCard}>
        <Text style={styles.emoji}>{message.emoji}</Text>
        <Text style={[styles.message, { color: message.color }]}>{message.text}</Text>
        <Text style={styles.heroSubtitle}>สรุปผลการเล่นของหมวด {category.name} ในระดับ {difficulty}</Text>
      </View>

      <View style={styles.scoreCard}>
        <View style={styles.scoreMain}>
          <Text style={styles.scoreTitle}>คะแนนการตอบถูก</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreTotal}>/{total}</Text>
          </View>
          <Text style={styles.percentage}>{percentage}% Accuracy</Text>
        </View>

        <View style={styles.finalScoreContainer}>
          <Text style={styles.finalScoreLabel}>คะแนนที่ได้รับ</Text>
          <Text style={styles.finalScoreText}>+{finalScore}</Text>
          {difficulty === 'hard' && (
            <Text style={styles.bonusText}>โหมดยากตอบถูกได้ 2 คะแนน และหากใช้คำใบ้จะเหลือ 1 คะแนน</Text>
          )}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: 'rgba(39, 214, 155, 0.15)' }]}>
          <Text style={styles.statValue}>{score}</Text>
          <Text style={styles.statLabel}>ตอบถูก</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: 'rgba(255, 107, 122, 0.15)' }]}>
          <Text style={styles.statValue}>{wrongCount}</Text>
          <Text style={styles.statLabel}>ตอบผิด</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: 'rgba(32, 211, 255, 0.15)' }]}>
          <Text style={styles.statValue}>{answeredQuestions.filter((item) => item.usedHint).length}</Text>
          <Text style={styles.statLabel}>ใช้คำใบ้</Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewTitle}>Review ทุกข้อ</Text>
        <Text style={styles.reviewSubtitle}>ตรวจคำตอบย้อนหลังและดูจุดที่ตอบถูกหรือพลาดในแต่ละข้อ</Text>
        {answeredQuestions.map((item, index) => {
          const answerDisplay = item.question.answerEn
            ? `${item.question.answer} / ${item.question.answerEn}`
            : item.question.answer;
          const reviewPrompt = getQuestionPrompt(item.question, category.name);

          return (
            <View key={index} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewHeaderLeft}>
                  <Text style={styles.reviewNumber}>ข้อ {index + 1}</Text>
                  {item.usedHint && <Text style={styles.usedHintBadge}>ใช้คำใบ้</Text>}
                </View>
                <View style={[styles.reviewResultPill, item.correct ? styles.reviewResultCorrect : styles.reviewResultWrong]}>
                  <Text style={styles.reviewResultText}>{item.correct ? 'ถูก' : 'ผิด'}</Text>
                </View>
              </View>
              <Text style={styles.reviewPrompt}>{reviewPrompt}</Text>
              <Text style={styles.reviewAnswer}>คำตอบที่ถูก: {answerDisplay}</Text>
              <Text style={styles.reviewUserAnswer}>คำตอบของคุณ: {item.userAnswer || '-'}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: category.color }]}
          onPress={() => navigation.navigate('Game', { category, difficulty })}
          activeOpacity={0.92}
        >
          <Text style={styles.primaryButtonText}>เล่นอีกครั้ง</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Difficulty', { category })}
          activeOpacity={0.92}
        >
          <Text style={styles.secondaryButtonText}>เปลี่ยนความยาก</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.92}
        >
          <Text style={styles.ghostButtonText}>กลับหน้าหลัก</Text>
        </TouchableOpacity>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginTop: 8,
    marginBottom: 14,
    alignItems: 'center',
    ...shadows.card
  },
  emoji: {
    fontSize: 44,
    marginBottom: 6,
  },
  message: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6
  },
  heroSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center'
  },
  scoreCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  scoreMain: {
    alignItems: 'center'
  },
  scoreTitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.text,
  },
  scoreTotal: {
    fontSize: 28,
    color: colors.textMuted,
  },
  percentage: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accentSecondary,
    marginTop: 6,
  },
  finalScoreContainer: {
    marginTop: 16,
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
  },
  finalScoreLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: '700'
  },
  bonusText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18
  },
  finalScoreText: {
    fontSize: 26,
    color: colors.success,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    borderRadius: radii.lg,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  reviewSection: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  reviewSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usedHintBadge: {
    fontSize: 11,
    backgroundColor: 'rgba(255, 184, 77, 0.18)',
    color: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  reviewNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  reviewResultPill: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  reviewResultCorrect: {
    backgroundColor: 'rgba(39, 214, 155, 0.18)'
  },
  reviewResultWrong: {
    backgroundColor: 'rgba(255, 107, 122, 0.16)'
  },
  reviewResultText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text
  },
  reviewPrompt: {
    fontSize: 13,
    color: colors.textSoft,
    lineHeight: 19,
    marginBottom: 4
  },
  reviewAnswer: {
    fontSize: 13,
    color: colors.success,
    marginBottom: 4,
  },
  reviewUserAnswer: {
    fontSize: 13,
    color: colors.textMuted,
  },
  buttonContainer: {
    gap: 10,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    ...shadows.soft
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700'
  },
  ghostButton: {
    paddingVertical: 12,
    alignItems: 'center'
  },
  ghostButtonText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700'
  },
});
