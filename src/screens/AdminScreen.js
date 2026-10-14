import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { Audio } from 'expo-av';
import ScreenShell from '../components/ScreenShell';
import { db } from '../services/firebase';
import { clearQuestionsCache } from '../services/quizService';
import { colors, radii, shadows } from '../theme/appTheme';

export default function AdminScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'users'

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Audio Playback state
  const [sound, setSound] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null); // question.id | 'modal-preview' | null
  const [loadingAudioId, setLoadingAudioId] = useState(null);

  // Question Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // null if adding
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formAnswerEn, setFormAnswerEn] = useState('');
  const [formCategory, setFormCategory] = useState('vehicles');
  const [formDifficulty, setFormDifficulty] = useState('easy');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAudioUrl, setFormAudioUrl] = useState('');
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [refreshingUsers, setRefreshingUsers] = useState(false);
  const [selectedUserForStats, setSelectedUserForStats] = useState(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync().catch(() => {});
        setSound(null);
      }
      setPlayingAudioId(null);
      setLoadingAudioId(null);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const playAudio = async (audioUrl, idKey) => {
    if (!audioUrl || !audioUrl.trim()) return;

    try {
      if (playingAudioId === idKey) {
        await stopAudio();
        return;
      }

      if (sound) {
        await sound.unloadAsync().catch(() => {});
        setSound(null);
      }

      setLoadingAudioId(idKey);
      setPlayingAudioId(idKey);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl.trim() },
        { shouldPlay: true }
      );

      setSound(newSound);
      setLoadingAudioId(null);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingAudioId(null);
          setLoadingAudioId(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio in admin screen:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเล่นไฟล์เสียงนี้ได้ กรุณาตรวจสอบ URL หรือการเชื่อมต่อ');
      setPlayingAudioId(null);
      setLoadingAudioId(null);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchUsers();
  }, []);

  // Fetch Questions from Firestore
  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const snapshot = await getDocs(collection(db, 'questions'));
      const qList = [];
      snapshot.forEach((docItem) => {
        qList.push({ id: docItem.id, ...docItem.data() });
      });
      setQuestions(qList);
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลคำถามได้');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Fetch Users from Firestore
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const snapshot = await getDocs(collection(db, 'users'));
      const uList = [];
      snapshot.forEach((docItem) => {
        uList.push({ id: docItem.id, ...docItem.data() });
      });
      // Sort users by totalScore descending
      uList.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
      setUsers(uList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
      setRefreshingUsers(false);
    }
  };

  const handleRefreshUsers = useCallback(() => {
    setRefreshingUsers(true);
    fetchUsers();
  }, []);

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const qText = q.question || '';
    const qAns = q.answer || '';
    const qAnsEn = q.answerEn || '';
    const queryLower = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !queryLower ||
      qText.toLowerCase().includes(queryLower) ||
      qAns.toLowerCase().includes(queryLower) ||
      qAnsEn.toLowerCase().includes(queryLower);

    const matchesCategory =
      selectedCategory === 'all' || q.category === selectedCategory;

    const matchesDifficulty =
      selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Open Modal for Add
  const handleOpenAddModal = () => {
    stopAudio();
    setEditingQuestion(null);
    setFormQuestion('สิ่งนี้คืออะไร?');
    setFormAnswer('');
    setFormAnswerEn('');
    setFormCategory('vehicles');
    setFormDifficulty('easy');
    setFormImageUrl('');
    setFormAudioUrl('');
    setModalVisible(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (q) => {
    stopAudio();
    setEditingQuestion(q);
    setFormQuestion(q.question || '');
    setFormAnswer(q.answer || '');
    setFormAnswerEn(q.answerEn || '');
    setFormCategory(q.category || 'vehicles');
    setFormDifficulty(q.difficulty || 'easy');
    setFormImageUrl(q.imageUrl || '');
    setFormAudioUrl(q.audioUrl || '');
    setModalVisible(true);
  };

  // Save Question (Add or Update)
  const handleSaveQuestion = async () => {
    if (!formQuestion.trim() || !formAnswer.trim()) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกคำถามและคำตอบภาษาไทย');
      return;
    }

    setSavingQuestion(true);
    try {
      const questionData = {
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        answerEn: formAnswerEn.trim(),
        category: formCategory,
        difficulty: formDifficulty,
        imageUrl: formImageUrl.trim(),
        audioUrl: formAudioUrl.trim()
      };

      if (editingQuestion) {
        // Update existing document
        const docRef = doc(db, 'questions', editingQuestion.id);
        await updateDoc(docRef, questionData);
        Alert.alert('สำเร็จ', 'อัปเดตคำถามเรียบร้อย');
      } else {
        // Add new document
        await addDoc(collection(db, 'questions'), questionData);
        Alert.alert('สำเร็จ', 'เพิ่มคำถามใหม่เรียบร้อย');
      }

      clearQuestionsCache();
      stopAudio();
      setModalVisible(false);
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลคำถามได้');
    } finally {
      setSavingQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = (questionId) => {
    Alert.alert(
      'ยืนยันการลบคำถาม',
      'คุณต้องการลบคำถามนี้ออกจากระบบใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบข้อมูล',
          style: 'destructive',
          onPress: async () => {
            try {
              stopAudio();
              await deleteDoc(doc(db, 'questions', questionId));
              clearQuestionsCache();
              Alert.alert('สำเร็จ', 'ลบคำถามเรียบร้อยแล้ว');
              fetchQuestions();
            } catch (error) {
              console.error('Error deleting question:', error);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบคำถามได้');
            }
          }
        }
      ]
    );
  };

  // Reset User Score
  const handleResetUserScore = (userId, userName) => {
    Alert.alert(
      'ยืนยันรีเซ็ตคะแนน',
      `คุณต้องการรีเซ็ตคะแนนของผู้เล่น "${userName}" เป็น 0 ใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'รีเซ็ต',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', userId), {
                totalScore: 0,
                gamesPlayed: 0,
                scores: {}
              });
              Alert.alert('สำเร็จ', 'รีเซ็ตคะแนนเรียบร้อยแล้ว');
              fetchUsers();
            } catch (error) {
              console.error('Error resetting score:', error);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถรีเซ็ตคะแนนได้');
            }
          }
        }
      ]
    );
  };

  // Delete User
  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      'ยืนยันลบผู้เล่น',
      `คุณต้องการลบผู้เล่น "${userName}" ออกจากระบบใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบผู้เล่น',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              Alert.alert('สำเร็จ', 'ลบผู้เล่นออกจากระบบเรียบร้อย');
              fetchUsers();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบผู้เล่นได้');
            }
          }
        }
      ]
    );
  };

  // Category labels helper
  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'vehicles':
        return '🚗 ยานพาหนะ';
      case 'animals':
        return '🐘 สัตว์';
      case 'musical_instruments':
        return '🎸 เครื่องดนตรี';
      default:
        return cat;
    }
  };

  return (
    <ScreenShell scroll={false} accentColor={colors.gold} secondaryAccentColor={colors.accentSecondary}>
      {/* Top Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopSheen} />
        <View style={styles.headerRow}>
          <View style={styles.headerTitleWrap}>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>👑 ADMIN DASHBOARD</Text>
            </View>
            <Text style={styles.headerTitle}>แผงควบคุมแอดมิน</Text>
          </View>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.homeBtnText}>🏠 หน้าหลัก</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'questions' && styles.tabBtnActive]}
          onPress={() => setActiveTab('questions')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabBtnText, activeTab === 'questions' && styles.tabBtnTextActive]}>
            ❓ คำถาม ({questions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'users' && styles.tabBtnActive]}
          onPress={() => setActiveTab('users')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabBtnText, activeTab === 'users' && styles.tabBtnTextActive]}>
            👥 ผู้เล่น ({users.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: QUESTION MANAGEMENT */}
      {activeTab === 'questions' && (
        <View style={{ flex: 1 }}>
          {/* Controls Bar: Search + Add */}
          <View style={styles.controlsCard}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="🔍 ค้นหาคำถามหรือคำตอบ..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleOpenAddModal}
                activeOpacity={0.9}
              >
                <Text style={styles.addBtnText}>+ เพิ่มคำถาม</Text>
              </TouchableOpacity>
            </View>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.chip, selectedCategory === 'all' && styles.chipActive]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={[styles.chipText, selectedCategory === 'all' && styles.chipTextActive]}>🌐 ทั้งหมด</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, selectedCategory === 'vehicles' && styles.chipActive]}
                onPress={() => setSelectedCategory('vehicles')}
              >
                <Text style={[styles.chipText, selectedCategory === 'vehicles' && styles.chipTextActive]}>🚗 ยานพาหนะ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, selectedCategory === 'animals' && styles.chipActive]}
                onPress={() => setSelectedCategory('animals')}
              >
                <Text style={[styles.chipText, selectedCategory === 'animals' && styles.chipTextActive]}>🐘 สัตว์</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, selectedCategory === 'musical_instruments' && styles.chipActive]}
                onPress={() => setSelectedCategory('musical_instruments')}
              >
                <Text style={[styles.chipText, selectedCategory === 'musical_instruments' && styles.chipTextActive]}>🎸 เครื่องดนตรี</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Difficulty Filter */}
            <View style={styles.diffRow}>
              <TouchableOpacity
                style={[styles.diffChip, selectedDifficulty === 'all' && styles.diffChipActive]}
                onPress={() => setSelectedDifficulty('all')}
              >
                <Text style={[styles.diffChipText, selectedDifficulty === 'all' && styles.diffChipTextActive]}>ระดับทั้งหมด</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.diffChip, selectedDifficulty === 'easy' && styles.diffEasyActive]}
                onPress={() => setSelectedDifficulty('easy')}
              >
                <Text style={[styles.diffChipText, selectedDifficulty === 'easy' && styles.diffEasyTextActive]}>🌱 ง่าย</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.diffChip, selectedDifficulty === 'hard' && styles.diffHardActive]}
                onPress={() => setSelectedDifficulty('hard')}
              >
                <Text style={[styles.diffChipText, selectedDifficulty === 'hard' && styles.diffHardTextActive]}>🔥 ยาก</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* List of Questions */}
          {loadingQuestions ? (
            <View style={styles.centerWrap}>
              <ActivityIndicator size="large" color={colors.accentSecondary} />
              <Text style={styles.loadingText}>กำลังโหลดคำถามทั้งหมด...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredQuestions}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>📭</Text>
                  <Text style={styles.emptyTitle}>ไม่พบรายการคำถาม</Text>
                  <Text style={styles.emptySubtitle}>ลองเปลี่ยนคำค้นหาหรือตัวกรอง หรือกดเพิ่มคำถามใหม่</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.qCard}>
                  <View style={styles.qImageWrap}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.qImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.qImagePlaceholder}>
                        <Text style={styles.qPlaceholderEmoji}>🖼️</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.qBody}>
                    <View style={styles.qBadgeRow}>
                      <View style={styles.qCatBadge}>
                        <Text style={styles.qCatBadgeText}>{getCategoryLabel(item.category)}</Text>
                      </View>
                      <View style={[styles.qDiffBadge, item.difficulty === 'hard' ? styles.qDiffHard : styles.qDiffEasy]}>
                        <Text style={styles.qDiffBadgeText}>
                          {item.difficulty === 'hard' ? '🔥 ยาก (2pt)' : '🌱 ง่าย (1pt)'}
                        </Text>
                      </View>
                      {item.audioUrl ? (
                        <View style={[styles.qCatBadge, { backgroundColor: 'rgba(32, 211, 255, 0.18)' }]}>
                          <Text style={[styles.qCatBadgeText, { color: colors.accentSecondary }]}>🔊 มีไฟล์เสียง</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.qTitle}>{item.question}</Text>
                    <Text style={styles.qAnswer}>
                      💡 ตอบ: <Text style={styles.qAnswerHighlight}>{item.answer}</Text>
                      {item.answerEn ? ` (${item.answerEn})` : ''}
                    </Text>

                    <View style={styles.qActionsRow}>
                      {item.audioUrl ? (
                        <TouchableOpacity
                          style={[
                            styles.audioBtn,
                            playingAudioId === item.id && styles.audioBtnPlaying
                          ]}
                          onPress={() => playAudio(item.audioUrl, item.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={[
                            styles.audioBtnText,
                            playingAudioId === item.id && styles.audioBtnTextPlaying
                          ]}>
                            {playingAudioId === item.id ? '⏹️ หยุด' : '🔊 ฟังเสียง'}
                          </Text>
                        </TouchableOpacity>
                      ) : null}

                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => handleOpenEditModal(item)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.editBtnText}>✏️ แก้ไข</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteQuestion(item.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.deleteBtnText}>🗑️ ลบ</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}

      {/* TAB 2: USER / LEADERBOARD MANAGEMENT */}
      {activeTab === 'users' && (
        <View style={{ flex: 1 }}>
          {loadingUsers && !refreshingUsers ? (
            <View style={styles.centerWrap}>
              <ActivityIndicator size="large" color={colors.gold} />
              <Text style={styles.loadingText}>กำลังดึงรายชื่อผู้เล่น...</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshingUsers} onRefresh={handleRefreshUsers} tintColor={colors.white} />
              }
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>👥</Text>
                  <Text style={styles.emptyTitle}>ไม่พบข้อมูลผู้เล่น</Text>
                  <Text style={styles.emptySubtitle}>ลองค้นหาด้วยชื่ออื่น หรือรอให้มีผู้เล่นใหม่สะสมคะแนน</Text>
                </View>
              }
              renderItem={({ item, index }) => {
                const uName = item.username || item.email?.split('@')[0] || 'Unknown User';
                const rank = index + 1;
                const isTop1 = rank === 1;
                const isTop2 = rank === 2;
                const isTop3 = rank === 3;
                const avgScore = item.gamesPlayed && item.gamesPlayed > 0
                  ? (item.totalScore / item.gamesPlayed).toFixed(1)
                  : '0';

                return (
                  <TouchableOpacity
                    style={styles.userCard}
                    activeOpacity={0.88}
                    onPress={() => setSelectedUserForStats(item)}
                  >
                    <View style={[
                      styles.rankBadgeCircle,
                      isTop1 && styles.rankTop1,
                      isTop2 && styles.rankTop2,
                      isTop3 && styles.rankTop3
                    ]}>
                      <Text style={[
                        styles.rankBadgeText,
                        (isTop1 || isTop2 || isTop3) && styles.rankBadgeTextTop
                      ]}>
                        {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${rank}`}
                      </Text>
                    </View>

                    <View style={styles.userInfo}>
                      <Text style={styles.userName} numberOfLines={1}>{uName}</Text>
                      <Text style={styles.userEmail} numberOfLines={1}>{item.email || 'ไม่ระบุอีเมล'}</Text>
                      <View style={styles.userStatsRow}>
                        <Text style={styles.userStatBadge}>⭐ {item.totalScore || 0} แต้ม</Text>
                        <Text style={styles.userStatBadge}>🎮 {item.gamesPlayed || 0} รอบ</Text>
                        <Text style={[styles.userStatBadge, { color: colors.accentSecondary, backgroundColor: 'rgba(32, 211, 255, 0.12)' }]}>
                          🎯 เฉลี่ย {avgScore}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.userActions}>
                      <TouchableOpacity
                        style={styles.viewStatsBtn}
                        onPress={() => setSelectedUserForStats(item)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.viewStatsBtnText}>📊 ดูสถิติ</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.resetScoreBtn}
                        onPress={() => handleResetUserScore(item.id, uName)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.resetScoreBtnText}>🔄 รีเซ็ต</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteUserBtn}
                        onPress={() => handleDeleteUser(item.id, uName)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.deleteUserBtnText}>🗑️ ลบ</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}

      {/* MODAL FOR VIEWING PLAYER STATS */}
      <Modal
        visible={!!selectedUserForStats}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedUserForStats(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.userModalBadge}>
                  <Text style={styles.userModalBadgeText}>📊 สถิติผู้เล่นรายบุคคล</Text>
                </View>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedUserForStats?.username || selectedUserForStats?.email?.split('@')[0] || 'ผู้เล่น'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedUserForStats(null)}
              >
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalFormScroll}>
              {/* Profile summary card */}
              <View style={styles.playerMetaCard}>
                <View style={styles.playerMetaAvatar}>
                  <Text style={{ fontSize: 26 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.playerMetaName}>
                    {selectedUserForStats?.username || 'ไม่ระบุชื่อ'}
                  </Text>
                  <Text style={styles.playerMetaEmail}>
                    ✉️ {selectedUserForStats?.email || 'ไม่ระบุอีเมล'}
                  </Text>
                  <Text style={styles.playerMetaId} numberOfLines={1}>
                    🆔 UID: {selectedUserForStats?.id}
                  </Text>
                </View>
              </View>

              {/* 3 Overview Stat Boxes */}
              <Text style={styles.statsSubtitle}>🏆 สถิติภาพรวม</Text>
              <View style={styles.statsGrid3}>
                <View style={[styles.statBoxMini, styles.statBorderGold]}>
                  <Text style={styles.statMiniIcon}>⭐</Text>
                  <Text style={[styles.statMiniNum, { color: '#FBBF24' }]}>
                    {selectedUserForStats?.totalScore || 0}
                  </Text>
                  <Text style={styles.statMiniLabel}>คะแนนรวม</Text>
                </View>

                <View style={[styles.statBoxMini, styles.statBorderGreen]}>
                  <Text style={styles.statMiniIcon}>🎮</Text>
                  <Text style={[styles.statMiniNum, { color: '#34D399' }]}>
                    {selectedUserForStats?.gamesPlayed || 0}
                  </Text>
                  <Text style={styles.statMiniLabel}>จำนวนรอบ</Text>
                </View>

                <View style={[styles.statBoxMini, styles.statBorderBlue]}>
                  <Text style={styles.statMiniIcon}>🎯</Text>
                  <Text style={[styles.statMiniNum, { color: colors.accentSecondary }]}>
                    {selectedUserForStats?.gamesPlayed > 0
                      ? (selectedUserForStats.totalScore / selectedUserForStats.gamesPlayed).toFixed(1)
                      : 0}
                  </Text>
                  <Text style={styles.statMiniLabel}>เฉลี่ย/รอบ</Text>
                </View>
              </View>

              {/* Category Breakdown */}
              <Text style={styles.statsSubtitle}>🎯 คะแนนแยกตามหมวดหมู่</Text>
              <View style={styles.statTableCard}>
                <View style={styles.statTableRow}>
                  <Text style={styles.statTableLabel}>🚗 ยานพาหนะ (Vehicles)</Text>
                  <Text style={styles.statTableValue}>
                    {selectedUserForStats?.scores?.vehicles || 0} แต้ม
                  </Text>
                </View>
                <View style={styles.statTableRow}>
                  <Text style={styles.statTableLabel}>🐘 สัตว์ (Animals)</Text>
                  <Text style={styles.statTableValue}>
                    {selectedUserForStats?.scores?.animals || 0} แต้ม
                  </Text>
                </View>
                <View style={[styles.statTableRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.statTableLabel}>🎸 เครื่องดนตรี (Instruments)</Text>
                  <Text style={styles.statTableValue}>
                    {selectedUserForStats?.scores?.musical_instruments || 0} แต้ม
                  </Text>
                </View>
              </View>

              {/* Difficulty Breakdown */}
              <Text style={styles.statsSubtitle}>🔥 คะแนนแยกตามระดับความยาก</Text>
              <View style={styles.statTableCard}>
                <View style={styles.statTableRow}>
                  <Text style={styles.statTableLabel}>🌱 ระดับง่าย (Easy - 1 คะแนน)</Text>
                  <Text style={[styles.statTableValue, { color: '#34D399' }]}>
                    {selectedUserForStats?.scores?.easy || 0} แต้ม
                  </Text>
                </View>
                <View style={[styles.statTableRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.statTableLabel}>🔥 ระดับยาก (Hard - 2 คะแนน)</Text>
                  <Text style={[styles.statTableValue, { color: '#F87171' }]}>
                    {selectedUserForStats?.scores?.hard || 0} แต้ม
                  </Text>
                </View>
              </View>

              {/* Specific Matrix Breakdown */}
              <Text style={styles.statsSubtitle}>📋 สถิติแบบเจาะจง (หมวดหมู่ × ความยาก)</Text>
              <View style={styles.statTableCard}>
                <View style={styles.statTableRow}>
                  <Text style={styles.statTableLabel}>🚗 ยานพาหนะ (ง่าย / ยาก)</Text>
                  <Text style={styles.statTableValue}>
                    {selectedUserForStats?.scores?.vehicles_easy || 0} / {selectedUserForStats?.scores?.vehicles_hard || 0} แต้ม
                  </Text>
                </View>
                <View style={styles.statTableRow}>
                  <Text style={styles.statTableLabel}>🐘 สัตว์ (ง่าย / ยาก)</Text>
                  <Text style={styles.statTableValue}>
                    {selectedUserForStats?.scores?.animals_easy || 0} / {selectedUserForStats?.scores?.animals_hard || 0} แต้ม
                  </Text>
                </View>
                <View style={[styles.statTableRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.statTableLabel}>🎸 เครื่องดนตรี (ง่าย / ยาก)</Text>
                  <Text style={styles.statTableValue}>
                    {selectedUserForStats?.scores?.musical_instruments_easy || 0} / {selectedUserForStats?.scores?.musical_instruments_hard || 0} แต้ม
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSelectedUserForStats(null)}
              >
                <Text style={styles.modalCancelBtnText}>ปิดหน้าต่าง</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resetScoreBtn, { flex: 1, paddingVertical: 12, borderRadius: radii.md, alignItems: 'center' }]}
                onPress={() => {
                  const u = selectedUserForStats;
                  setSelectedUserForStats(null);
                  handleResetUserScore(u.id, u.username || u.email);
                }}
              >
                <Text style={[styles.resetScoreBtnText, { fontSize: 13 }]}>🔄 รีเซ็ตคะแนน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL FOR ADD / EDIT QUESTION */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          stopAudio();
          setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingQuestion ? '✏️ แก้ไขคำถาม' : '➕ เพิ่มคำถามใหม่'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  stopAudio();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalFormScroll}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>คำถาม / โจทย์</Text>
                <TextInput
                  style={styles.formInput}
                  value={formQuestion}
                  onChangeText={setFormQuestion}
                  placeholder="เช่น ยานพาหนะชนิดนี้คืออะไร?"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>คำตอบ (ภาษาไทย)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formAnswer}
                  onChangeText={setFormAnswer}
                  placeholder="เช่น รถยนต์"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>คำตอบ (ภาษาอังกฤษ)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formAnswerEn}
                  onChangeText={setFormAnswerEn}
                  placeholder="เช่น car"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>หมวดหมู่</Text>
                <View style={styles.radioRow}>
                  <TouchableOpacity
                    style={[styles.radioChip, formCategory === 'vehicles' && styles.radioChipActive]}
                    onPress={() => setFormCategory('vehicles')}
                  >
                    <Text style={[styles.radioText, formCategory === 'vehicles' && styles.radioTextActive]}>
                      🚗 ยานพาหนะ
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioChip, formCategory === 'animals' && styles.radioChipActive]}
                    onPress={() => setFormCategory('animals')}
                  >
                    <Text style={[styles.radioText, formCategory === 'animals' && styles.radioTextActive]}>
                      🐘 สัตว์
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioChip, formCategory === 'musical_instruments' && styles.radioChipActive]}
                    onPress={() => setFormCategory('musical_instruments')}
                  >
                    <Text style={[styles.radioText, formCategory === 'musical_instruments' && styles.radioTextActive]}>
                      🎸 เครื่องดนตรี
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>ระดับความยาก</Text>
                <View style={styles.radioRow}>
                  <TouchableOpacity
                    style={[styles.radioChip, formDifficulty === 'easy' && styles.radioChipEasyActive]}
                    onPress={() => setFormDifficulty('easy')}
                  >
                    <Text style={[styles.radioText, formDifficulty === 'easy' && styles.radioTextEasyActive]}>
                      🌱 ง่าย (Easy - 1 คะแนน)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioChip, formDifficulty === 'hard' && styles.radioChipHardActive]}
                    onPress={() => setFormDifficulty('hard')}
                  >
                    <Text style={[styles.radioText, formDifficulty === 'hard' && styles.radioTextHardActive]}>
                      🔥 ยาก (Hard - 2 คะแนน)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>URL รูปภาพ (Image URL)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formImageUrl}
                  onChangeText={setFormImageUrl}
                  placeholder="https://images.unsplash.com/..."
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.fieldBlock}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>URL เสียง (Audio URL)</Text>
                  {formAudioUrl.trim() ? (
                    <TouchableOpacity
                      style={[
                        styles.audioPreviewBtn,
                        playingAudioId === 'modal-preview' && styles.audioPreviewBtnPlaying
                      ]}
                      onPress={() => playAudio(formAudioUrl.trim(), 'modal-preview')}
                      activeOpacity={0.8}
                    >
                      {loadingAudioId === 'modal-preview' ? (
                        <ActivityIndicator size="small" color={colors.white} style={{ marginRight: 4 }} />
                      ) : null}
                      <Text style={[
                        styles.audioPreviewBtnText,
                        playingAudioId === 'modal-preview' && styles.audioPreviewBtnTextPlaying
                      ]}>
                        {playingAudioId === 'modal-preview' ? '⏹️ หยุดเล่น' : '▶️ ทดลองฟังเสียง'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <TextInput
                  style={styles.formInput}
                  value={formAudioUrl}
                  onChangeText={setFormAudioUrl}
                  placeholder="https://example.com/sound.mp3 (ถ้ามี)"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  stopAudio();
                  setModalVisible(false);
                }}
                disabled={savingQuestion}
              >
                <Text style={styles.modalCancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, savingQuestion && { opacity: 0.7 }]}
                onPress={handleSaveQuestion}
                disabled={savingQuestion}
              >
                {savingQuestion ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalSaveBtnText}>💾 บันทึกข้อมูล</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    padding: 14,
    marginTop: 4,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card
  },
  headerTopSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FBBF24'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitleWrap: {
    flex: 1
  },
  adminBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginBottom: 4
  },
  adminBadgeText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900'
  },
  homeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  homeBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800'
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radii.lg,
    padding: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radii.md
  },
  tabBtnActive: {
    backgroundColor: colors.accent,
    ...shadows.soft
  },
  tabBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  tabBtnTextActive: {
    color: colors.white,
    fontWeight: '900'
  },

  controlsCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 13
  },
  addBtn: {
    backgroundColor: '#10B981',
    borderRadius: radii.md,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900'
  },
  filterScroll: {
    gap: 6,
    marginBottom: 8
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  chipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderColor: '#818CF8'
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700'
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '800'
  },
  diffRow: {
    flexDirection: 'row',
    gap: 6
  },
  diffChip: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center'
  },
  diffChipActive: {
    borderColor: colors.accentSecondary
  },
  diffEasyActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981'
  },
  diffHardActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444'
  },
  diffChipText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700'
  },
  diffChipTextActive: {
    color: colors.white,
    fontWeight: '800'
  },
  diffEasyTextActive: {
    color: '#34D399',
    fontWeight: '800'
  },
  diffHardTextActive: {
    color: '#F87171',
    fontWeight: '800'
  },

  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 10
  },
  listContainer: {
    paddingBottom: 16,
    gap: 10
  },
  emptyCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center'
  },

  qCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    ...shadows.soft
  },
  qImageWrap: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    marginRight: 10
  },
  qImage: {
    width: '100%',
    height: '100%'
  },
  qImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  qPlaceholderEmoji: {
    fontSize: 28
  },
  qBody: {
    flex: 1
  },
  qBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4
  },
  qCatBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.pill
  },
  qCatBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700'
  },
  qDiffBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.pill
  },
  qDiffEasy: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)'
  },
  qDiffHard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)'
  },
  qDiffBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700'
  },
  qTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2
  },
  qAnswer: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 6
  },
  qAnswerHighlight: {
    color: colors.accentSecondary,
    fontWeight: '800'
  },
  qActionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-end'
  },
  editBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  editBtnText: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '800'
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  deleteBtnText: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: '800'
  },
  audioBtn: {
    backgroundColor: 'rgba(32, 211, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(32, 211, 255, 0.4)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  audioBtnPlaying: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444'
  },
  audioBtnText: {
    color: colors.accentSecondary,
    fontSize: 10,
    fontWeight: '800'
  },
  audioBtnTextPlaying: {
    color: '#F87171'
  },
  audioBadge: {
    backgroundColor: 'rgba(32, 211, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(32, 211, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  audioBadgePlaying: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: '#EF4444'
  },
  audioBadgeText: {
    color: colors.accentSecondary,
    fontSize: 9,
    fontWeight: '800'
  },
  audioBadgeTextPlaying: {
    color: '#F87171'
  },
  diffAudioActive: {
    backgroundColor: 'rgba(32, 211, 255, 0.2)',
    borderColor: colors.accentSecondary
  },
  diffAudioTextActive: {
    color: colors.accentSecondary,
    fontWeight: '800'
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    ...shadows.soft
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  userAvatarEmoji: {
    fontSize: 20
  },
  userInfo: {
    flex: 1
  },
  userName: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 1
  },
  userEmail: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 4
  },
  userStatsRow: {
    flexDirection: 'row',
    gap: 6
  },
  userStatBadge: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill
  },
  userActions: {
    gap: 6,
    alignItems: 'flex-end'
  },
  resetScoreBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  resetScoreBtnText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '800'
  },
  deleteUserBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  deleteUserBtnText: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: '800'
  },
  viewStatsBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  viewStatsBtnText: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '800'
  },
  rankBadgeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  rankTop1: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1.5,
    borderColor: '#F59E0B'
  },
  rankTop2: {
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
    borderWidth: 1.5,
    borderColor: '#94A3B8'
  },
  rankTop3: {
    backgroundColor: 'rgba(217, 119, 6, 0.25)',
    borderWidth: 1.5,
    borderColor: '#D97706'
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textMuted
  },
  rankBadgeTextTop: {
    fontSize: 15,
    color: '#FBBF24'
  },
  userModalBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)'
  },
  userModalBadgeText: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '800'
  },
  playerMetaCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceStrong,
    padding: 12,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  playerMetaAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)'
  },
  playerMetaName: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900'
  },
  playerMetaEmail: {
    color: colors.textSoft,
    fontSize: 11,
    marginTop: 2
  },
  playerMetaId: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 2
  },
  statsSubtitle: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 6
  },
  statsGrid3: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6
  },
  statBoxMini: {
    flex: 1,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1
  },
  statBorderGold: {
    borderColor: 'rgba(245, 158, 11, 0.35)'
  },
  statBorderGreen: {
    borderColor: 'rgba(16, 185, 129, 0.35)'
  },
  statBorderBlue: {
    borderColor: 'rgba(32, 211, 255, 0.35)'
  },
  statMiniIcon: {
    fontSize: 16,
    marginBottom: 2
  },
  statMiniNum: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 1
  },
  statMiniLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700'
  },
  statTableCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 4
  },
  statTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)'
  },
  statTableLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '600'
  },
  statTableValue: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800'
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 16
  },
  modalContentCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    maxHeight: '85%',
    padding: 16,
    ...shadows.card
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900'
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCloseBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800'
  },
  modalFormScroll: {
    marginBottom: 12
  },
  fieldBlock: {
    marginBottom: 12
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  fieldLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6
  },
  audioPreviewBtn: {
    backgroundColor: 'rgba(32, 211, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(32, 211, 255, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center'
  },
  audioPreviewBtnPlaying: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444'
  },
  audioPreviewBtnText: {
    color: colors.accentSecondary,
    fontSize: 11,
    fontWeight: '800'
  },
  audioPreviewBtnTextPlaying: {
    color: '#F87171'
  },
  formInput: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14
  },
  radioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  radioChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  radioChipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderColor: '#818CF8'
  },
  radioChipEasyActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: '#10B981'
  },
  radioChipHardActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: '#EF4444'
  },
  radioText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700'
  },
  radioTextActive: {
    color: colors.white,
    fontWeight: '900'
  },
  radioTextEasyActive: {
    color: '#34D399',
    fontWeight: '900'
  },
  radioTextHardActive: {
    color: '#F87171',
    fontWeight: '900'
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  modalCancelBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700'
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    ...shadows.soft
  },
  modalSaveBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900'
  }
});
