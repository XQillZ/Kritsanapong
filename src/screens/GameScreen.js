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
      <View style={[styles.container, { backgroundColor: category?.color || '#3498DB', justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={{ marginTop: 16, color: '#2C3E50' }}>กำลังโหลด...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

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
      currentQuestion.question || '',
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
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: category.color }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.progressText}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {currentQuestion.question && (
            <View style={styles.textQuestionContainer}>
              <Text style={styles.textQuestion}>{currentQuestion.question}</Text>
            </View>
          )}

          {currentQuestion.displayMediaMode === 'image' && currentQuestion.imageUrl && (
            <View style={styles.imageContainer}>
              {imageLoading && (
                <View style={styles.imagePlaceholder}>
                  <ActivityIndicator size="large" color="#2C3E50" />
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
            >
              <Text style={styles.audioButtonText}>
                {isPlaying ? '🔊 กำลังเล่น...' : '▶️ ฟังเสียงคำถาม'}
              </Text>
            </TouchableOpacity>
          )}

          {currentQuestion.displayMediaMode === 'none' && !currentQuestion.question && (
            <View style={styles.noMediaContainer}>
               <Text style={styles.noMediaText}>ไม่มีรูปภาพหรือเสียง</Text>
            </View>
          )}

          {!showingFeedback ? (
          <>
            {hint ? (
              <View style={styles.hintDisplayContainer}>
                <Text style={styles.hintDisplayEmoji}>💡</Text>
                <Text style={styles.hintDisplayText}>{hint}</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.hintRequestButton, isHintLoading && styles.hintRequestButtonDisabled]} 
                onPress={handleRequestHint}
                disabled={isHintLoading}
              >
                <Text style={styles.hintRequestButtonText}>
                  {isHintLoading ? 'กำลังคิดคำใบ้...' : `💡 ขอคำใบ้ ${difficulty === 'hard' ? '(โหมดยากเหลือ 1 คะแนน)' : ''}`}
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.hint}>คำตอบคืออะไร?</Text>
            <TextInput
              style={styles.input}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="พิมพ์คำตอบที่นี่..."
              placeholderTextColor="#95A5A6"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>ส่งคำตอบ</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.feedbackContainer}>
            <View style={[styles.feedbackBadge, isCorrect ? styles.correctBadge : styles.wrongBadge]}>
              <Text style={styles.feedbackEmoji}>{isCorrect ? '✅' : '❌'}</Text>
              <Text style={styles.feedbackText}>
                {isCorrect ? 'ถูกต้อง!' : 'ผิด!'}
              </Text>
            </View>
            {!isCorrect && (
              <Text style={styles.correctAnswer}>
                คำตอบที่ถูกต้อง: {currentQuestion.answer} หรือ {currentQuestion.answerEn}
              </Text>
            )}
            <Text style={styles.yourAnswer}>
              คำตอบของคุณ: {userAnswer}
            </Text>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentIndex + 1 < questions.length ? 'ข้อถัดไป →' : 'ดูผลลัพธ์'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      </ScrollView>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>คะแนน: {score} / {questions.length}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2C3E50',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    textAlign: 'right',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  textQuestionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  textQuestion: {
    fontSize: 20,
    color: '#2C3E50',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    marginBottom: 20,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  audioButton: {
    backgroundColor: '#9B59B6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  audioButtonPlaying: {
    backgroundColor: '#8E44AD',
  },
  audioButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noMediaContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginBottom: 20,
  },
  noMediaText: {
    fontSize: 16,
    color: '#95A5A6',
  },
  noImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 16,
    color: '#95A5A6',
  },
  hint: {
    fontSize: 18,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#2C3E50',
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#2C3E50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    alignItems: 'center',
  },
  feedbackBadge: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  correctBadge: {
    backgroundColor: '#27AE60',
  },
  wrongBadge: {
    backgroundColor: '#E74C3C',
  },
  feedbackEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  correctAnswer: {
    fontSize: 18,
    color: '#27AE60',
    fontWeight: '600',
    marginBottom: 8,
  },
  yourAnswer: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  hintRequestButton: {
    backgroundColor: '#F39C12',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  hintRequestButtonDisabled: {
    backgroundColor: '#F39C1280',
  },
  hintRequestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintDisplayContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1C40F',
  },
  hintDisplayEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  hintDisplayText: {
    flex: 1,
    fontSize: 16,
    color: '#D35400',
    lineHeight: 24,
  },
});
