import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Audio } from 'expo-av';
import { compareAnswers } from '../utils/textUtils';
import { fetchQuestionsByCategory } from '../services/quizService';
import { getRandomQuestions } from '../utils/shuffle';
import { getHintFromGemini } from '../services/aiService';
import ScreenShell from '../components/ScreenShell';
import { categoryMeta, colors, difficultyMeta, radii, shadows } from '../theme/appTheme';
import { getQuestionPrompt } from '../utils/questionPrompt';

const QUESTIONS_PER_GAME = 10;

export default function GameScreen({ navigation, route }) {
  const { category, difficulty } = route.params;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hint, setHint] = useState('');
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [usedHint, setUsedHint] = useState(false);

  useEffect(() => {
    loadQuestions();
    
    // Cleanup sound when component unmounts
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadQuestions = async () => {
    try {
      const allQuestions = await fetchQuestionsByCategory(category.id, difficulty);
      if (allQuestions.length === 0) {
        Alert.alert('ไม่พบคำถาม', 'หมวดหมู่นี้ยังไม่มีคำถาม', [
          { text: 'กลับ', onPress: () => navigation.goBack() }
        ]);
        return;
      }
      const selectedQuestions = getRandomQuestions(allQuestions, QUESTIONS_PER_GAME);
      
      // สุ่มเลือกรูปภาพหรือเสียงสำหรับข้อที่มีทั้งสองอย่าง
      const processedQuestions = selectedQuestions.map(q => {
        let mode = 'none';
        if (q.imageUrl && q.audioUrl) {
          mode = Math.random() < 0.5 ? 'image' : 'audio';
        } else if (q.imageUrl) { 
          mode = 'image';
        } else if (q.audioUrl) {
          mode = 'audio';
        }
        return { ...q, displayMediaMode: mode };
      });
      
      setQuestions(processedQuestions);
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดคำถามได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading || questions.length === 0) {
    return (
      <ScreenShell scroll={false} accentColor={category?.color || colors.accent} secondaryAccentColor={colors.accentSecondary}>
        <View style={styles.loadingWrap}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={styles.loadingTitle}>กำลังเตรียมคำถามให้คุณ</Text>
            <Text style={styles.loadingText}>กำลังโหลดคำถามและสื่อที่ใช้ในรอบนี้</Text>
          </View>
        </View>
      </ScreenShell>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  const categoryInfo = categoryMeta[category.id];
  const difficultyInfo = difficultyMeta[difficulty];
  const currentQuestionPrompt = getQuestionPrompt(currentQuestion, category.name);
  const answerDisplay = currentQuestion.answerEn
    ? `${currentQuestion.answer} หรือ ${currentQuestion.answerEn}`
    : currentQuestion.answer;

  const playAudio = async () => {
    if (!currentQuestion.audioUrl) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      setIsPlaying(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentQuestion.audioUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเล่นเสียงได้');
      setIsPlaying(false);
    }
  };

  const handleRequestHint = async () => {
    if (usedHint) return;
    setIsHintLoading(true);
    const hintText = await getHintFromGemini(
      category.name,
      currentQuestionPrompt,
      currentQuestion.answer
    );
    setHint(hintText);
    setUsedHint(true);
    setIsHintLoading(false);
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      Alert.alert('กรุณากรอกคำตอบ');
      return;
    }

    const correct = compareAnswers(userAnswer, currentQuestion.answer, currentQuestion.answerEn);
    setIsCorrect(correct);
    
    if (correct) {
      // ถ้าเป็นโหมดยากและใช้คำใบ้ จะได้แค่ 1 คะแนนแทนที่จะเป็น 2
      // การคูณคะแนนจะทำใน ResultScreen แต่เราจะเก็บสถิติ hint ไว้เพื่อคำนวณใหม่
      setScore(score + 1);
    }

    setAnsweredQuestions([
      ...answeredQuestions,
      {
        question: currentQuestion,
        userAnswer,
        correct,
        usedHint
      }
    ]);

    setShowingFeedback(true);
  };

  const handleNext = () => {
    setUserAnswer('');
    setShowingFeedback(false);
    setImageLoading(true);
    setHint('');
    setIsHintLoading(false);
    setUsedHint(false);
    
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
    
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('Result', {
        score,
        total: questions.length,
        answeredQuestions: [...answeredQuestions, {
          question: currentQuestion,
          userAnswer,
          correct: isCorrect,
          usedHint
        }],
        category,
        difficulty
      });
    }
  };

  return (
    <ScreenShell scroll={false} accentColor={category.color} secondaryAccentColor={difficultyInfo?.accent || colors.warning}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerIdentity}>
              <View style={[styles.headerIconWrap, { backgroundColor: `${category.color}22` }]}> 
                <Text style={styles.headerIcon}>{categoryInfo?.icon || '🎮'}</Text>
              </View>
              <View>
                <Text style={styles.headerEyebrow}>{category.name}</Text>
                <Text style={styles.headerTitle}>ข้อที่ {currentIndex + 1} จาก {questions.length}</Text>
              </View>
            </View>
            <View style={[styles.modeBadge, { backgroundColor: `${difficultyInfo?.accent || colors.warning}22` }]}>
              <Text style={[styles.modeBadgeText, { color: difficultyInfo?.accent || colors.warning }]}>{difficulty?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: category.color }]} />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>คะแนนปัจจุบัน</Text>
              <Text style={styles.metricValue}>{score}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>คำใบ้</Text>
              <Text style={styles.metricValue}>{usedHint ? 'ใช้แล้ว' : 'พร้อมใช้'}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.questionPill}>
              <Text style={styles.questionPillText}>โจทย์ประจำข้อ</Text>
            </View>

            <View style={styles.textQuestionContainer}>
              <Text style={styles.textQuestion}>{currentQuestionPrompt}</Text>
            </View>

            {currentQuestion.displayMediaMode === 'image' && currentQuestion.imageUrl && (
              <View style={styles.imageContainer}>
                {imageLoading && (
                  <View style={styles.imagePlaceholder}>
                    <ActivityIndicator size="large" color={colors.white} />
                  </View>
                )}
                <Image
                  source={{ uri: currentQuestion.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                />
              </View>
            )}

            {currentQuestion.displayMediaMode === 'audio' && currentQuestion.audioUrl && (
              <TouchableOpacity
                style={[styles.audioButton, isPlaying && styles.audioButtonPlaying]}
                onPress={playAudio}
                disabled={isPlaying}
                activeOpacity={0.9}
              >
                <Text style={styles.audioButtonEmoji}>{isPlaying ? '🔊' : '🎧'}</Text>
                <View>
                  <Text style={styles.audioButtonTitle}>{isPlaying ? 'กำลังเล่นเสียงคำถาม...' : 'แตะเพื่อฟังเสียงคำถาม'}</Text>
                  <Text style={styles.audioButtonText}>{isPlaying ? 'กำลังเล่นไฟล์เสียง' : 'ใช้สำหรับคำถามที่อ้างอิงจากเสียงหรือสื่อผสม'}</Text>
                </View>
              </TouchableOpacity>
            )}

            {currentQuestion.displayMediaMode === 'none' && (
              <View style={styles.noMediaContainer}>
                <Text style={styles.noMediaEmoji}>🧩</Text>
                <Text style={styles.noMediaTitle}>ไม่มีรูปภาพหรือเสียงสำหรับข้อนี้</Text>
                <Text style={styles.noMediaText}>ให้ใช้ข้อความโจทย์และคำใบ้อัจฉริยะช่วยวิเคราะห์คำตอบ</Text>
              </View>
            )}

            {!showingFeedback ? (
              <>
                {hint ? (
                  <View style={styles.hintDisplayContainer}>
                    <Text style={styles.hintDisplayEmoji}>💡</Text>
                    <View style={styles.hintDisplayContent}>
                      <Text style={styles.hintDisplayLabel}>คำใบ้</Text>
                      <Text style={styles.hintDisplayText}>{hint}</Text>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.hintRequestButton, isHintLoading && styles.hintRequestButtonDisabled]}
                    onPress={handleRequestHint}
                    disabled={isHintLoading}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.hintRequestButtonText}>
                      {isHintLoading ? 'กำลังสร้างคำใบ้อัจฉริยะ...' : `💡 ขอคำใบ้ ${difficulty === 'hard' ? '(โหมดยากเหลือ 1 คะแนน)' : ''}`}
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.answerSection}>
                  <Text style={styles.answerLabel}>คำตอบของคุณ</Text>
                  <TextInput
                    style={styles.input}
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    placeholder="พิมพ์คำตอบที่นี่..."
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity style={[styles.submitButton, { backgroundColor: category.color }]} onPress={handleSubmit} activeOpacity={0.92}>
                    <Text style={styles.submitButtonText}>ส่งคำตอบ</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.feedbackContainer}>
                <View style={[styles.feedbackBadge, isCorrect ? styles.correctBadge : styles.wrongBadge]}>
                  <Text style={styles.feedbackEmoji}>{isCorrect ? '✅' : '❌'}</Text>
                  <Text style={styles.feedbackText}>{isCorrect ? 'ถูกต้อง!' : 'ยังไม่ถูกนะ'}</Text>
                  <Text style={styles.feedbackSubtext}>{isCorrect ? 'ยอดเยี่ยม คุณเก็บคะแนนเพิ่มได้แล้ว' : 'ลองดูคำตอบที่ถูกต้องแล้วไปต่อข้อต่อไป'}</Text>
                </View>
                {!isCorrect && (
                  <Text style={styles.correctAnswer}>คำตอบที่ถูกต้อง: {answerDisplay}</Text>
                )}
                <Text style={styles.yourAnswer}>คำตอบของคุณ: {userAnswer}</Text>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.92}>
                  <Text style={styles.nextButtonText}>
                    {currentIndex + 1 < questions.length ? 'ไปข้อถัดไป' : 'ดูผลลัพธ์'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
  },
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
  headerCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginTop: 8,
    marginBottom: 12,
    ...shadows.card
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10
  },
  headerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  headerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  headerIcon: {
    fontSize: 20
  },
  headerEyebrow: {
    color: colors.accentSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2
  },
  headerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800'
  },
  modeBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.09)',
    overflow: 'hidden',
    marginBottom: 10
  },
  progressBar: {
    height: '100%',
    borderRadius: radii.pill
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 4
  },
  metricValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800'
  },
  card: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  scrollContent: {
    paddingBottom: 16
  },
  questionPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12
  },
  questionPillText: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  textQuestionContainer: {
    marginBottom: 14,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentSecondary
  },
  textQuestion: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '800',
    lineHeight: 24
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.02,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    marginBottom: 14
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    zIndex: 1
  },
  image: {
    width: '100%',
    height: '100%'
  },
  audioButton: {
    backgroundColor: 'rgba(165, 109, 255, 0.18)',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginBottom: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(165, 109, 255, 0.28)'
  },
  audioButtonPlaying: {
    backgroundColor: 'rgba(165, 109, 255, 0.28)'
  },
  audioButtonEmoji: {
    fontSize: 24,
    marginRight: 10
  },
  audioButtonTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2
  },
  audioButtonText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17
  },
  noMediaContainer: {
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginBottom: 14,
    padding: 18
  },
  noMediaEmoji: {
    fontSize: 28,
    marginBottom: 8
  },
  noMediaTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6
  },
  noMediaText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18
  },
  answerSection: {
    marginTop: 2
  },
  answerLabel: {
    fontSize: 14,
    color: colors.textSoft,
    marginBottom: 8,
    fontWeight: '700'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
    marginBottom: 12
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    ...shadows.soft
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800'
  },
  feedbackContainer: {
    alignItems: 'center'
  },
  feedbackBadge: {
    width: '100%',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginBottom: 12
  },
  correctBadge: {
    backgroundColor: 'rgba(39, 214, 155, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(39, 214, 155, 0.32)'
  },
  wrongBadge: {
    backgroundColor: 'rgba(255, 107, 122, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 122, 0.3)'
  },
  feedbackEmoji: {
    fontSize: 30,
    marginBottom: 6
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4
  },
  feedbackSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18
  },
  correctAnswer: {
    width: '100%',
    fontSize: 14,
    color: colors.success,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center'
  },
  yourAnswer: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 14,
    textAlign: 'center'
  },
  nextButton: {
    width: '100%',
    backgroundColor: colors.accentSecondary,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    ...shadows.soft
  },
  nextButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '800'
  },
  hintRequestButton: {
    backgroundColor: 'rgba(255, 184, 77, 0.18)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 77, 0.28)'
  },
  hintRequestButtonDisabled: {
    opacity: 0.7
  },
  hintRequestButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700'
  },
  hintDisplayContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 184, 77, 0.16)',
    padding: 12,
    borderRadius: radii.lg,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 77, 0.3)'
  },
  hintDisplayEmoji: {
    fontSize: 18,
    marginRight: 10
  },
  hintDisplayContent: {
    flex: 1
  },
  hintDisplayLabel: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 3
  },
  hintDisplayText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20
  }
});
