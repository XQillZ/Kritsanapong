import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Audio } from 'expo-av';
import { doc, updateDoc, increment } from 'firebase/firestore';
import ScreenShell from '../components/ScreenShell';
import { auth, db } from '../services/firebase';
import { colors, difficultyMeta, radii, shadows } from '../theme/appTheme';
import { getQuestionPrompt } from '../utils/questionPrompt';

export default function ResultScreen({ navigation, route }) {
  const { score, total, answeredQuestions, category, difficulty } = route.params;
  const wrongCount = total - score;
  const percentage = Math.round((score / total) * 100);

  const [sound, setSound] = useState(null);
  const [playingAudioIndex, setPlayingAudioIndex] = useState(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playAudio = async (audioUrl, index) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      if (playingAudioIndex === index) {
        setPlayingAudioIndex(null);
        return;
      }

      setPlayingAudioIndex(index);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingAudioIndex(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio in result screen:', error);
      setPlayingAudioIndex(null);
    }
  };

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
      {/* Victory Celebration Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroGlowSheen} />
        <View style={styles.badgeRow}>
          <Text style={styles.heroBadgeText}>⚡ MATCH PERFORMANCE SUMMARY</Text>
        </View>
        <Text style={styles.emoji}>{message.emoji}</Text>
        <Text style={[styles.message, { color: message.color }]}>{message.text}</Text>
        <Text style={styles.heroSubtitle}>
          หมวดหมู่ {category.name} • ระดับ {difficulty === 'hard' ? 'โหมดยาก 🔥' : 'โหมดง่าย 🌱'}
        </Text>
      </View>

      {/* 3D Combat Score Terminal */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreCardSheen} />

        <View style={styles.scoreMain}>
          <Text style={styles.scoreTitle}>ความแม่นยำในการตอบคำถาม</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreTotal}>/{total}</Text>
          </View>
          <View style={styles.percentageBadge}>
            <Text style={styles.percentage}>{percentage}% ACCURACY</Text>
          </View>
        </View>

        <View style={styles.finalScoreContainer}>
          <Text style={styles.finalScoreLabel}>⭐ คะแนนรวมที่ได้รับในรอบนี้</Text>
          <View style={styles.finalScorePill}>
            <Text style={styles.finalScoreText}>+{finalScore} PTS</Text>
          </View>
          {difficulty === 'hard' && (
            <Text style={styles.bonusText}>
              โหมดยาก: ข้อที่ตอบถูกโดยไม่ใช้คำใบ้ได้รับ 2 คะแนน / ใช้คำใบ้ได้รับ 1 คะแนน
            </Text>
          )}
        </View>
      </View>

      {/* 3 Sci-Fi Mini Pods */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardCorrect]}>
          <Text style={styles.statEmoji}>✅</Text>
          <Text style={[styles.statValue, { color: '#34D399' }]}>{score}</Text>
          <Text style={styles.statLabel}>ตอบถูก</Text>
        </View>
        <View style={[styles.statCard, styles.statCardWrong]}>
          <Text style={styles.statEmoji}>❌</Text>
          <Text style={[styles.statValue, { color: '#F87171' }]}>{wrongCount}</Text>
          <Text style={styles.statLabel}>ตอบผิด</Text>
        </View>
        <View style={[styles.statCard, styles.statCardHint]}>
          <Text style={styles.statEmoji}>🤖</Text>
          <Text style={[styles.statValue, { color: '#C084FC' }]}>{answeredQuestions.filter((item) => item.usedHint).length}</Text>
          <Text style={styles.statLabel}>ใช้คำใบ้</Text>
        </View>
      </View>

      {/* Question Review Section */}
      <View style={styles.reviewSection}>
        <View style={styles.reviewHeaderTitleRow}>
          <Text style={styles.reviewSectionTag}>🔍 DETAILED BREAKDOWN</Text>
          <Text style={styles.reviewTitle}>ตรวจทานคำตอบทั้งหมด 10 ข้อ</Text>
          <Text style={styles.reviewSubtitle}>ดูภาพ เสียง และคำตอบที่ถูกต้องเพื่อพัฒนาฝีมือ</Text>
        </View>

        {answeredQuestions.map((item, index) => {
          const answerDisplay = item.question.answerEn
            ? `${item.question.answer} / ${item.question.answerEn}`
            : item.question.answer;
          const reviewPrompt = getQuestionPrompt(item.question, category.name);
          const hasImage = !!item.question.imageUrl && (item.question.displayMediaMode === 'image' || item.question.displayMediaMode !== 'audio');
          const hasAudio = !!item.question.audioUrl && (item.question.displayMediaMode === 'audio' || item.question.displayMediaMode !== 'image');

          return (
            <View 
              key={index} 
              style={[
                styles.reviewItem, 
                item.correct ? styles.reviewItemCorrect : styles.reviewItemWrong
              ]}
            >
              <View style={styles.reviewHeader}>
                <View style={styles.reviewHeaderLeft}>
                  <View style={styles.reviewNumberBadge}>
                    <Text style={styles.reviewNumberText}>ข้อที่ 0{index + 1}</Text>
                  </View>
                  {item.usedHint && (
                    <View style={styles.usedHintBadge}>
                      <Text style={styles.usedHintBadgeText}>🤖 ใช้ AI คำใบ้</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.reviewResultPill, item.correct ? styles.reviewResultCorrect : styles.reviewResultWrong]}>
                  <Text style={[styles.reviewResultText, { color: item.correct ? '#34D399' : '#F87171' }]}>
                    {item.correct ? '✓ ถูกต้อง' : '✗ ตอบผิด'}
                  </Text>
                </View>
              </View>

              {hasImage && (
                <View style={styles.reviewMediaWrap}>
                  <Image
                    source={{ uri: item.question.imageUrl }}
                    style={styles.reviewImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              {hasAudio && (
                <View style={styles.reviewMediaWrap}>
                  <TouchableOpacity
                    style={[styles.reviewAudioBtn, playingAudioIndex === index && styles.reviewAudioBtnPlaying]}
                    onPress={() => playAudio(item.question.audioUrl, index)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.reviewAudioEmoji}>{playingAudioIndex === index ? '🔊' : '🎧'}</Text>
                    <Text style={styles.reviewAudioText}>
                      {playingAudioIndex === index ? 'กำลังเล่นเสียงคำถาม...' : 'แตะเพื่อฟังเสียงคำถามในข้อนี้'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.reviewPrompt}>{reviewPrompt}</Text>

              <View style={styles.reviewAnswerCard}>
                <Text style={styles.reviewAnswerLabel}>💡 คำตอบที่ถูกต้อง:</Text>
                <Text style={styles.reviewAnswerText}>{answerDisplay}</Text>
              </View>

              <View style={styles.reviewUserCard}>
                <Text style={styles.reviewUserLabel}>คำตอบของคุณ:</Text>
                <Text style={[styles.reviewUserText, { color: item.correct ? '#34D399' : '#F87171' }]}>
                  {item.userAnswer || '(ไม่ได้กรอกคำตอบ)'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: category.color }]}
          onPress={() => navigation.navigate('Game', { category, difficulty })}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>🔁 เล่นอีกครั้งในหมวดนี้</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Leaderboard')}
          activeOpacity={0.9}
        >
          <Text style={styles.secondaryButtonText}>🏆 ดูตารางอันดับ (Leaderboard)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.88}
        >
          <Text style={styles.ghostButtonText}>🏠 กลับหน้าหลัก</Text>
        </TouchableOpacity>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.45)',
    padding: 18,
    marginTop: 6,
    marginBottom: 12,
    alignItems: 'center',
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
    backgroundColor: 'rgba(251, 191, 36, 0.8)'
  },
  badgeRow: {
    marginBottom: 6
  },
  heroBadgeText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  emoji: {
    fontSize: 48,
    marginBottom: 4
  },
  message: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  heroSubtitle: {
    color: '#D1D5DB',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '500'
  },
  scoreCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card
  },
  scoreCardSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)'
  },
  scoreMain: {
    alignItems: 'center'
  },
  scoreTitle: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '700',
    marginBottom: 8
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  scoreNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: colors.white
  },
  scoreTotal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#9CA3AF'
  },
  percentageBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    marginTop: 4
  },
  percentage: {
    fontSize: 12,
    fontWeight: '900',
    color: '#A5B4FC',
    letterSpacing: 0.5
  },
  finalScoreContainer: {
    marginTop: 14,
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%'
  },
  finalScoreLabel: {
    fontSize: 12,
    color: '#D1D5DB',
    marginBottom: 6,
    fontWeight: '700'
  },
  finalScorePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: '#FBBF24'
  },
  finalScoreText: {
    fontSize: 22,
    color: '#FBBF24',
    fontWeight: '900'
  },
  bonusText: {
    fontSize: 11,
    color: '#FDE68A',
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 16
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  statCard: {
    flex: 1,
    borderRadius: radii.xl,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1
  },
  statCardCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)'
  },
  statCardWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)'
  },
  statCardHint: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderColor: 'rgba(168, 85, 247, 0.35)'
  },
  statEmoji: {
    fontSize: 16,
    marginBottom: 2
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900'
  },
  statLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '700'
  },
  reviewSection: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...shadows.card
  },
  reviewHeaderTitleRow: {
    marginBottom: 12
  },
  reviewSectionTag: {
    color: '#818CF8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 2
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 2
  },
  reviewSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500'
  },
  reviewItem: {
    borderRadius: radii.xl,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)'
  },
  reviewItemCorrect: {
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  reviewItemWrong: {
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  reviewNumberBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  reviewNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white
  },
  usedHintBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)'
  },
  usedHintBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C084FC'
  },
  reviewResultPill: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1
  },
  reviewResultCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: '#10B981'
  },
  reviewResultWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderColor: '#EF4444'
  },
  reviewResultText: {
    fontSize: 11,
    fontWeight: '900'
  },
  reviewMediaWrap: {
    marginTop: 4,
    marginBottom: 8,
    borderRadius: radii.lg,
    overflow: 'hidden'
  },
  reviewImage: {
    width: '100%',
    height: 160,
    borderRadius: radii.lg,
    backgroundColor: '#05021a'
  },
  reviewAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8
  },
  reviewAudioBtnPlaying: {
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
    borderColor: '#EC4899'
  },
  reviewAudioEmoji: {
    fontSize: 18
  },
  reviewAudioText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800'
  },
  reviewPrompt: {
    fontSize: 13,
    color: '#E5E7EB',
    lineHeight: 18,
    fontWeight: '700',
    marginBottom: 8
  },
  reviewAnswerCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: 8,
    borderRadius: radii.md,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  reviewAnswerLabel: {
    fontSize: 9,
    color: '#FBBF24',
    fontWeight: '800',
    marginBottom: 1
  },
  reviewAnswerText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '800'
  },
  reviewUserCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  reviewUserLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '700',
    marginBottom: 1
  },
  reviewUserText: {
    fontSize: 13,
    fontWeight: '800'
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 16
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: radii.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: radii.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderWidth: 1.5,
    borderColor: '#FBBF24'
  },
  secondaryButtonText: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: '900'
  },
  ghostButton: {
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  ghostButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800'
  }
});
