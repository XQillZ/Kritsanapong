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
        answeredQuestions,
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
        {/* Cyber HUD Header */}
        <View style={[styles.headerCard, { borderColor: `${category.color}55` }]}>
          <View style={[styles.headerGlowSheen, { backgroundColor: category.color }]} />

          <View style={styles.headerTopRow}>
            <View style={styles.headerIdentity}>
              <View style={[styles.headerIconWrap, { backgroundColor: `${category.color}25`, borderColor: category.color }]}> 
                <Text style={styles.headerIcon}>{categoryInfo?.icon || '🎮'}</Text>
              </View>
              <View style={styles.headerTitleWrap}>
                <Text style={[styles.headerEyebrow, { color: category.color }]}>{category.name.toUpperCase()}</Text>
                <Text style={styles.headerTitle}>ข้อที่ {currentIndex + 1} / {questions.length}</Text>
              </View>
            </View>

            <View style={[styles.modeBadge, { 
              backgroundColor: difficulty === 'hard' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              borderColor: difficulty === 'hard' ? '#EF4444' : '#10B981'
            }]}>
              <Text style={[styles.modeBadgeText, { color: difficulty === 'hard' ? '#F87171' : '#34D399' }]}>
                {difficulty === 'hard' ? '🔥 HARD (2 PTS)' : '🌱 EASY (1 PT)'}
              </Text>
            </View>
          </View>

          {/* Animated Neon Progress Track */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: category.color }]} />
          </View>

          {/* HUD Mini Metrics Row */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, styles.metricScoreCard]}>
              <Text style={styles.metricEmoji}>⭐</Text>
              <View>
                <Text style={styles.metricLabel}>คะแนนสะสม</Text>
                <Text style={styles.metricValueGold}>{score} แต้ม</Text>
              </View>
            </View>

            <View style={[styles.metricCard, styles.metricHintCard]}>
              <Text style={styles.metricEmoji}>🤖</Text>
              <View>
                <Text style={styles.metricLabel}>AI คำใบ้</Text>
                <Text style={[styles.metricValue, { color: usedHint ? '#9CA3AF' : '#C084FC' }]}>
                  {usedHint ? 'ใช้แล้ว' : 'พร้อมใช้งาน'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Quiz Combat Card */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.cardTopSheen} />

            {/* Question Badge & Title */}
            <View style={styles.questionHeaderRow}>
              <View style={[styles.questionPill, { backgroundColor: `${category.color}25`, borderColor: category.color }]}>
                <Text style={[styles.questionPillText, { color: category.color }]}>● QUESTION #{currentIndex + 1}</Text>
              </View>
            </View>

            <View style={styles.textQuestionContainer}>
              <Text style={styles.textQuestion}>{currentQuestionPrompt}</Text>
            </View>

            {/* Image Media Arena */}
            {currentQuestion.displayMediaMode === 'image' && currentQuestion.imageUrl && (
              <View style={[styles.imageContainer, { borderColor: `${category.color}45` }]}>
                {imageLoading && (
                  <View style={styles.imagePlaceholder}>
                    <ActivityIndicator size="large" color={category.color} />
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

            {/* Audio Media Arena */}
            {currentQuestion.displayMediaMode === 'audio' && currentQuestion.audioUrl && (
              <TouchableOpacity
                style={[
                  styles.audioButton, 
                  isPlaying ? styles.audioButtonPlaying : styles.audioButtonIdle
                ]}
                onPress={playAudio}
                disabled={isPlaying}
                activeOpacity={0.88}
              >
                <View style={[styles.audioIconCircle, isPlaying && styles.audioIconPlaying]}>
                  <Text style={styles.audioButtonEmoji}>{isPlaying ? '🔊' : '🎧'}</Text>
                </View>
                <View style={styles.audioContentWrap}>
                  <Text style={styles.audioButtonTitle}>
                    {isPlaying ? 'กำลังเล่นไฟล์เสียง...' : 'แตะเพื่อฟังเสียงคำถาม'}
                  </Text>
                  <Text style={styles.audioButtonText}>
                    {isPlaying ? 'ฟังเสียงให้ละเอียดแล้วพิมพ์คำตอบ' : 'คำถามนี้อ้างอิงจากเสียงปริศนา'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {currentQuestion.displayMediaMode === 'none' && (
              <View style={styles.noMediaContainer}>
                <Text style={styles.noMediaEmoji}>🧩</Text>
                <Text style={styles.noMediaTitle}>คำถามแบบข้อความ</Text>
                <Text style={styles.noMediaText}>ใช้ข้อความโจทย์และคำใบ้ AI ช่วยคิดคำตอบ</Text>
              </View>
            )}

            {!showingFeedback ? (
              <>
                {/* AI Hint Section */}
                {hint ? (
                  <View style={styles.hintDisplayContainer}>
                    <View style={styles.hintDisplayHeader}>
                      <Text style={styles.hintDisplayEmoji}>💡</Text>
                      <Text style={styles.hintDisplayLabel}>AI คำใบ้อัจฉริยะ</Text>
                    </View>
                    <Text style={styles.hintDisplayText}>{hint}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.hintRequestButton, 
                      isHintLoading && styles.hintRequestButtonDisabled
                    ]}
                    onPress={handleRequestHint}
                    disabled={isHintLoading}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.hintRequestButtonText}>
                      {isHintLoading 
                        ? '⚡ AI กำลังประมวลผลคำใบ้...' 
                        : `💡 ขอคำใบ้ AI ${difficulty === 'hard' ? '(โหมดยากได้ 1 คะแนน)' : ''}`}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Cyber Input Section */}
                <View style={styles.answerSection}>
                  <Text style={styles.answerLabel}>⌨️ คำตอบของคุณ</Text>
                  <TextInput
                    style={[styles.input, { borderColor: `${category.color}66` }]}
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    placeholder="พิมพ์คำตอบภาษาไทย หรือ อังกฤษ..."
                    placeholderTextColor="#6B7280"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity 
                    style={[styles.submitButton, { backgroundColor: category.color }]} 
                    onPress={handleSubmit} 
                    activeOpacity={0.9}
                  >
                    <Text style={styles.submitButtonText}>🚀 ส่งคำตอบ</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              /* Feedback Display */
              <View style={styles.feedbackContainer}>
                <View style={[styles.feedbackBadge, isCorrect ? styles.correctBadge : styles.wrongBadge]}>
                  <Text style={styles.feedbackEmoji}>{isCorrect ? '🎉' : '❌'}</Text>
                  <Text style={styles.feedbackText}>{isCorrect ? 'ถูกต้องยอดเยี่ยม!' : 'ยังไม่ถูกต้องนะ'}</Text>
                  <Text style={styles.feedbackSubtext}>
                    {isCorrect ? `+${difficulty === 'hard' && !usedHint ? '2' : '1'} คะแนน เข้าสู่กระเป๋าแล้ว!` : 'ลองจำคำตอบที่ถูกต้อง แล้วลุยข้อถัดไปกันต่อ'}
                  </Text>
                </View>

                {!isCorrect && (
                  <View style={styles.correctAnswerCard}>
                    <Text style={styles.correctAnswerLabel}>💡 คำตอบที่ถูกต้อง:</Text>
                    <Text style={styles.correctAnswerText}>{answerDisplay}</Text>
                  </View>
                )}

                <View style={styles.yourAnswerCard}>
                  <Text style={styles.yourAnswerLabel}>คำตอบของคุณ:</Text>
                  <Text style={styles.yourAnswerText}>{userAnswer}</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.nextButton, { backgroundColor: category.color }]} 
                  onPress={handleNext} 
                  activeOpacity={0.9}
                >
                  <Text style={styles.nextButtonText}>
                    {currentIndex + 1 < questions.length ? '➔ ไปข้อถัดไป' : '🏆 ดูผลการแข่งขัน'}
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
    flex: 1
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 16
  },
  loadingCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.4)',
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
  headerCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    padding: 14,
    marginTop: 6,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card
  },
  headerGlowSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8
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
    borderWidth: 1.5,
    marginRight: 10
  },
  headerIcon: {
    fontSize: 20
  },
  headerTitleWrap: {
    flex: 1
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 2
  },
  headerTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900'
  },
  modeBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1
  },
  metricScoreCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.35)'
  },
  metricHintCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.35)'
  },
  metricEmoji: {
    fontSize: 18,
    marginRight: 8
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 1
  },
  metricValueGold: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '900'
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '900'
  },
  scrollContent: {
    paddingBottom: 20
  },
  card: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card
  },
  cardTopSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)'
  },
  questionHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  questionPill: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1
  },
  questionPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  textQuestionContainer: {
    marginBottom: 14,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radii.lg,
    borderLeftWidth: 3.5,
    borderLeftColor: '#818CF8'
  },
  textQuestion: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '800',
    lineHeight: 24
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.05,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: '#05021a',
    marginBottom: 14,
    borderWidth: 1.5
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#05021a',
    zIndex: 1
  },
  image: {
    width: '100%',
    height: '100%'
  },
  audioButton: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.xl,
    alignItems: 'center',
    marginBottom: 14,
    flexDirection: 'row',
    borderWidth: 1.5
  },
  audioButtonIdle: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.4)'
  },
  audioButtonPlaying: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderColor: '#EC4899'
  },
  audioIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  audioIconPlaying: {
    backgroundColor: 'rgba(236, 72, 153, 0.35)'
  },
  audioButtonEmoji: {
    fontSize: 22
  },
  audioContentWrap: {
    flex: 1
  },
  audioButtonTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2
  },
  audioButtonText: {
    color: '#D1D5DB',
    fontSize: 11,
    lineHeight: 16
  },
  noMediaContainer: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radii.xl,
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  noMediaEmoji: {
    fontSize: 28,
    marginBottom: 6
  },
  noMediaTitle: {
    fontSize: 15,
    color: colors.white,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4
  },
  noMediaText: {
    fontSize: 11.5,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16
  },
  hintRequestButton: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.xl,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.45)'
  },
  hintRequestButtonDisabled: {
    opacity: 0.6
  },
  hintRequestButtonText: {
    color: '#E9D5FF',
    fontSize: 13,
    fontWeight: '800'
  },
  hintDisplayContainer: {
    backgroundColor: 'rgba(168, 85, 247, 0.14)',
    padding: 14,
    borderRadius: radii.xl,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.45)'
  },
  hintDisplayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  hintDisplayEmoji: {
    fontSize: 16,
    marginRight: 6
  },
  hintDisplayLabel: {
    color: '#C084FC',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  hintDisplayText: {
    fontSize: 13.5,
    color: colors.white,
    lineHeight: 20,
    fontWeight: '600'
  },
  answerSection: {
    marginTop: 2
  },
  answerLabel: {
    fontSize: 13,
    color: '#E5E7EB',
    marginBottom: 8,
    fontWeight: '800'
  },
  input: {
    borderWidth: 1.5,
    borderRadius: radii.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 12,
    fontWeight: '600'
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: radii.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: 4
  },
  feedbackBadge: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: radii.xl,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5
  },
  correctBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: '#10B981'
  },
  wrongBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderColor: '#EF4444'
  },
  feedbackEmoji: {
    fontSize: 32,
    marginBottom: 4
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 4
  },
  feedbackSubtext: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500'
  },
  correctAnswerCard: {
    width: '100%',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: radii.lg,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center'
  },
  correctAnswerLabel: {
    fontSize: 10,
    color: '#FBBF24',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  correctAnswerText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: '900'
  },
  yourAnswerCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.lg,
    padding: 8,
    marginBottom: 14,
    alignItems: 'center'
  },
  yourAnswerLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '700',
    marginBottom: 2
  },
  yourAnswerText: {
    fontSize: 13,
    color: '#E5E7EB',
    fontWeight: '700'
  },
  nextButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: radii.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5
  }
});
