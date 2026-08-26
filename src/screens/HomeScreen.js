import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ScreenShell from '../components/ScreenShell';
import { auth, db } from '../services/firebase';
import { colors, radii, shadows } from '../theme/appTheme';

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [userStats, setUserStats] = useState({
    totalScore: 0,
    gamesPlayed: 0,
    scores: {}
  });

  // Pulse & Scale Animations for Epic Start Button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const rocketAnim = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  // Trophy Floating Animation & Press Scale for Leaderboard
  const trophyAnim = useRef(new Animated.Value(0)).current;
  const leadPressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Breathing pulse animation loop for Start Button
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.025,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(glowAnim, {
            toValue: 0.9,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false
          }),
          Animated.timing(rocketAnim, {
            toValue: -4,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false
          }),
          Animated.timing(rocketAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ])
    ).start();

    // Floating Trophy animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(trophyAnim, {
          toValue: -4,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(trophyAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.96,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  const handleLeadPressIn = () => {
    Animated.spring(leadPressScale, {
      toValue: 0.96,
      useNativeDriver: true
    }).start();
  };

  const handleLeadPressOut = () => {
    Animated.spring(leadPressScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  const fetchUserData = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || currentUser.displayName || 'Player');
          setUserStats({
            totalScore: data.totalScore || 0,
            gamesPlayed: data.gamesPlayed || 0,
            scores: data.scores || {}
          });
        } else {
          setUsername(currentUser.displayName || 'Player');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUsername(currentUser.displayName || 'Player');
      }
    } else {
      setUsername('Guest');
      setUserStats({ totalScore: 0, gamesPlayed: 0, scores: {} });
    }
  };

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData();
      } else {
        setUsername('Guest');
        setUserStats({ totalScore: 0, gamesPlayed: 0, scores: {} });
      }
    });

    const unsubscribeFocus = navigation.addListener('focus', () => {
      fetchUserData();
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFocus();
    };
  }, [navigation]);

  const handleStartGame = () => {
    navigation.navigate('Category');
  };

  const handleLogout = () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถออกจากระบบได้');
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenShell accentColor={colors.accent} secondaryAccentColor={colors.accentSecondary}>
      {/* Epic Top Profile HUD */}
      <View style={styles.topBar}>
        <View style={styles.identityCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{auth.currentUser ? '🧙‍♂️' : '👤'}</Text>
          </View>
          <View style={styles.identityTextWrap}>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.identityLabel}>{auth.currentUser ? 'ONLINE PLAYER' : 'GUEST MODE'}</Text>
            </View>
            <Text style={styles.identityValue} numberOfLines={1}>สวัสดี, {username}</Text>
          </View>
        </View>
        {auth.currentUser ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.logoutButtonText}>🚪 ออก</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>🔑 ล็อกอิน</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Epic Hero Title Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroGlowSheen} />
        <View style={styles.bannerImageWrap}>
          <Image
            source={require('../../assets/banner.png')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.heroHeaderRow}>
          <View style={styles.heroHeaderTitleWrap}>
            <Text style={styles.heroTitle}>AI Guess Game</Text>
          </View>
          <TouchableOpacity style={styles.heroHelpButton} onPress={() => setShowHelpModal(true)} activeOpacity={0.8}>
            <Text style={styles.heroHelpButtonText}>❓ วิธีเล่น</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.heroSubtitle}>
          เกมทายคำสื่อผสมสุดเร้าใจ • ระบบสุ่มโจทย์ภาพและเสียง • พร้อม AI คำใบ้อัจฉริยะแบบเรียลไทม์
        </Text>
      </View>

      {/* Epic Animated Start Game Button */}
      <Animated.View
        style={[
          styles.epicStartButtonWrapper,
          {
            transform: [
              { scale: Animated.multiply(pulseAnim, pressScale) }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.epicStartButton}
          onPress={handleStartGame}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.92}
        >
          {/* Top Sheen / Shimmer Bar */}
          <View style={styles.epicButtonSheen} />

          {/* Upper Header Row inside Button */}
          <View style={styles.epicButtonHeader}>
            <View style={styles.epicTagBadge}>
              <Text style={styles.epicTagDot}>●</Text>
              <Text style={styles.epicTagText}>CHALLENGE</Text>
            </View>
            <View style={styles.epicReadyBadge}>
              <Text style={styles.epicReadyText}>🔥 เริ่มเลย!</Text>
            </View>
          </View>

          {/* Main Action Content Row */}
          <View style={styles.epicButtonMainRow}>
            <Animated.View
              style={[
                styles.epicRocketWrap,
                { transform: [{ translateY: rocketAnim }] }
              ]}
            >
              <View style={styles.epicRocketInner}>
                <Text style={styles.epicRocketEmoji}>🚀</Text>
              </View>
            </Animated.View>

            <View style={styles.epicContentWrap}>
              <Text style={styles.epicButtonTitle}>เริ่มเล่นเกม</Text>
              <Text style={styles.epicButtonSubtitle}>ทายคำถามจากสื่อ 10 ข้อ • สะสมแต้ม • ชิงอันดับที่ 1</Text>
            </View>

            <View style={styles.epicArrowCircle}>
              <Text style={styles.epicArrowEmoji}>➔</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Epic Golden Leaderboard Button */}
      <Animated.View
        style={[
          styles.epicLeaderWrapper,
          { transform: [{ scale: leadPressScale }] }
        ]}
      >
        <TouchableOpacity
          style={styles.epicLeaderButton}
          onPress={() => navigation.navigate('Leaderboard')}
          onPressIn={handleLeadPressIn}
          onPressOut={handleLeadPressOut}
          activeOpacity={0.92}
        >
          {/* Top Gold Sheen Bar */}
          <View style={styles.epicLeaderSheen} />

          {/* Upper Header Row */}
          <View style={styles.epicLeaderHeader}>
            <View style={styles.epicLeaderTagBadge}>
              <Text style={styles.epicLeaderTagDot}>★</Text>
              <Text style={styles.epicLeaderTagText}>HALL OF FAME</Text>
            </View>
            <View style={styles.epicRankBadge}>
              <Text style={styles.epicRankText}>👑 TOP PLAYERS</Text>
            </View>
          </View>

          {/* Main Content Row */}
          <View style={styles.epicLeaderMainRow}>
            <Animated.View
              style={[
                styles.epicTrophyWrap,
                { transform: [{ translateY: trophyAnim }] }
              ]}
            >
              <View style={styles.epicTrophyInner}>
                <Text style={styles.epicTrophyEmoji}>🏆</Text>
              </View>
            </Animated.View>

            <View style={styles.epicLeaderContentWrap}>
              <Text style={styles.epicLeaderTitle}>ตารางคะแนน</Text>
              <Text style={styles.epicLeaderSubtitle}>หอเกียรติยศ • เช็คคะแนนผู้เล่นสูงสุด</Text>
            </View>

            <View style={styles.epicLeaderArrowCircle}>
              <Text style={styles.epicLeaderArrowEmoji}>➔</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Epic HUD Personal Playing Statistics Card */}
      <View style={styles.statsCardContainer}>
        <View style={styles.statsTopSheen} />
        <View style={styles.statsHeader}>
          <View style={styles.statsHeaderTitleWrap}>
            <View style={styles.statsIconWrap}>
              <Text style={styles.statsHeaderEmoji}>📊</Text>
            </View>
            <View>
              <Text style={styles.statsHeaderEyebrow}>LIVE COMBAT STATS</Text>
              <Text style={styles.statsHeaderTitle}>สถิติการเล่นของคุณ</Text>
            </View>
          </View>
        </View>

        {auth.currentUser ? (
          <View style={styles.statsGrid}>
            <View style={[styles.statItemCard, styles.statCardGold]}>
              <Text style={styles.statCardIcon}>⭐</Text>
              <Text style={[styles.statItemValue, styles.statValueGold]}>{userStats.totalScore}</Text>
              <Text style={styles.statItemLabel}>คะแนนรวม</Text>
            </View>
            <View style={[styles.statItemCard, styles.statCardCyan]}>
              <Text style={styles.statCardIcon}>🎮</Text>
              <Text style={[styles.statItemValue, styles.statValueCyan]}>{userStats.gamesPlayed}</Text>
              <Text style={styles.statItemLabel}>รอบที่เล่น</Text>
            </View>
            <View style={[styles.statItemCard, styles.statCardPurple]}>
              <Text style={styles.statCardIcon}>🔥</Text>
              <Text style={[styles.statItemValue, styles.statValuePurple]}>
                {userStats.gamesPlayed > 0 ? (userStats.totalScore / userStats.gamesPlayed).toFixed(1) : '0'}
              </Text>
              <Text style={styles.statItemLabel}>เฉลี่ย/รอบ</Text>
            </View>
          </View>
        ) : (
          <View style={styles.guestStatsPrompt}>
            <Text style={styles.guestStatsTitle}>✨ ปลดล็อกสถิติ & ชิงอันดับตารางคะแนน</Text>
            <Text style={styles.guestStatsText}>
              เข้าสู่ระบบเพื่อสะสมคะแนนรวมทุกรอบ บันทึกประวัติ และไอยศขึ้นสู่หอเกียรติยศ
            </Text>
            <TouchableOpacity style={styles.guestLoginBtn} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
              <Text style={styles.guestLoginBtnText}>🔑 เข้าสู่ระบบเพื่อเริ่มสะสมแต้ม</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Epic Cyber Help / How to Play Modal */}
      <Modal
        visible={showHelpModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.helpModalCard}>
            <View style={styles.modalTopSheen} />
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleWrap}>
                <View style={styles.modalBadgeRow}>
                  <Text style={styles.modalBadgeText}>📖 GAME GUIDE & RULES</Text>
                </View>
                <Text style={styles.modalTitle}>วิธีการเล่นเกม</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowHelpModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Steps Scroll */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={[styles.helpStepCard, styles.stepCardIndigo]}>
                <View style={[styles.helpStepBadge, styles.badgeIndigo]}>
                  <Text style={styles.helpStepBadgeText}>01</Text>
                </View>
                <View style={styles.helpStepBody}>
                  <Text style={styles.helpStepTitle}>🎯 เลือกหมวดหมู่ & ความยาก</Text>
                  <Text style={styles.helpStepDesc}>
                    กดปุ่ม "เริ่มเล่นเกม" แล้วเลือกหมวดที่สนใจ (ยานพาหนะ, สัตว์, เครื่องดนตรี) และเลือกระดับง่าย (1 คะแนน) หรือยาก (2 คะแนน)
                  </Text>
                </View>
              </View>

              <View style={[styles.helpStepCard, styles.stepCardCyan]}>
                <View style={[styles.helpStepBadge, styles.badgeCyan]}>
                  <Text style={styles.helpStepBadgeText}>02</Text>
                </View>
                <View style={styles.helpStepBody}>
                  <Text style={styles.helpStepTitle}>🎬 สังเกตภาพหรือฟังเสียง</Text>
                  <Text style={styles.helpStepDesc}>
                    ในแต่ละข้อระบบจะสุ่มแสดงรูปภาพหรือเปิดเสียงปริศนา ทายให้ถูกต้อง มีทั้งหมด 10 ข้อต่อรอบ
                  </Text>
                </View>
              </View>

              <View style={[styles.helpStepCard, styles.stepCardEmerald]}>
                <View style={[styles.helpStepBadge, styles.badgeEmerald]}>
                  <Text style={styles.helpStepBadgeText}>03</Text>
                </View>
                <View style={styles.helpStepBody}>
                  <Text style={styles.helpStepTitle}>⌨️ พิมพ์คำตอบอย่างอิสระ</Text>
                  <Text style={styles.helpStepDesc}>
                    พิมพ์คำตอบได้ทั้งภาษาไทยและอังกฤษ ตัวพิมพ์เล็กหรือใหญ่ก็ถูกต้องตามระบบตรวจคำตอบอัจฉริยะ
                  </Text>
                </View>
              </View>

              <View style={[styles.helpStepCard, styles.stepCardPink]}>
                <View style={[styles.helpStepBadge, styles.badgePink]}>
                  <Text style={styles.helpStepBadgeText}>04</Text>
                </View>
                <View style={styles.helpStepBody}>
                  <Text style={styles.helpStepTitle}>💡 ใช้คำใบ้ AI อัจฉริยะ</Text>
                  <Text style={styles.helpStepDesc}>
                    หากนึกไม่ออก กดปุ่ม "ขอคำใบ้" เพื่อให้ AI ช่วยแนะแนวทางคำตอบแบบไม่เฉลยตรงๆ
                  </Text>
                </View>
              </View>

              <View style={[styles.helpStepCard, styles.stepCardAmber]}>
                <View style={[styles.helpStepBadge, styles.badgeAmber]}>
                  <Text style={styles.helpStepBadgeText}>05</Text>
                </View>
                <View style={styles.helpStepBody}>
                  <Text style={styles.helpStepTitle}>🏆 เก็บแต้ม & ติดอันดับ Leaderboard</Text>
                  <Text style={styles.helpStepDesc}>
                    ตอบถูกให้ครบทุกข้อเพื่อสะสมคะแนนรวม และลุ้นติดอันดับต้นตารางบนหอเกียรติยศ!
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Bottom CTA Button */}
            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => setShowHelpModal(false)}
              activeOpacity={0.88}
            >
              <Text style={styles.modalPrimaryBtnText}>🚀 เข้าใจแล้ว เข้าเล่นเกมเลย!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
    gap: 10
  },
  identityCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radii.xl,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...shadows.soft
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1.5,
    borderColor: '#818CF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  avatarEmoji: {
    fontSize: 20
  },
  identityTextWrap: {
    flex: 1
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5
  },
  identityLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  identityValue: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800'
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: radii.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoutButtonText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '800'
  },
  loginButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1.5,
    borderColor: '#6366F1',
    borderRadius: radii.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3
  },
  loginButtonText: {
    color: '#C7D2FE',
    fontSize: 12,
    fontWeight: '800'
  },
  heroCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    padding: 15,
    marginBottom: 14,
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
    backgroundColor: 'rgba(167, 139, 250, 0.6)'
  },
  bannerImageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#05021a'
  },
  bannerImage: {
    width: '100%',
    height: '100%'
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6
  },
  heroHeaderTitleWrap: {
    flex: 1,
    marginRight: 10
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  heroBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  heroTitle: {
    color: colors.white,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  heroSubtitle: {
    color: '#D1D5DB',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500'
  },
  heroHelpButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  heroHelpButtonText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800'
  },

  epicStartButtonWrapper: {
    marginBottom: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12
  },
  epicStartButton: {
    backgroundColor: '#4F46E5',
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.65)',
    overflow: 'hidden',
    position: 'relative'
  },
  epicButtonSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)'
  },
  epicButtonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  epicTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)'
  },
  epicTagDot: {
    color: '#34D399',
    fontSize: 8,
    marginRight: 5
  },
  epicTagText: {
    color: '#E0E7FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  epicReadyBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radii.pill,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3
  },
  epicReadyText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  epicButtonMainRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  epicRocketWrap: {
    marginRight: 14
  },
  epicRocketInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  epicRocketEmoji: {
    fontSize: 26
  },
  epicContentWrap: {
    flex: 1
  },
  epicButtonTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  epicButtonSubtitle: {
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16
  },
  epicArrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4
  },
  epicArrowEmoji: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '900'
  },
  epicLeaderWrapper: {
    marginBottom: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10
  },
  epicLeaderButton: {
    backgroundColor: '#78350F',
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.65)',
    overflow: 'hidden',
    position: 'relative'
  },
  epicLeaderSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 251, 235, 0.5)'
  },
  epicLeaderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  epicLeaderTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)'
  },
  epicLeaderTagDot: {
    color: '#FBBF24',
    fontSize: 8,
    marginRight: 5
  },
  epicLeaderTagText: {
    color: '#FEF3C7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  epicRankBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radii.pill,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3
  },
  epicRankText: {
    color: '#451A03',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  epicLeaderMainRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  epicTrophyWrap: {
    marginRight: 14
  },
  epicTrophyInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  epicTrophyEmoji: {
    fontSize: 26
  },
  epicLeaderContentWrap: {
    flex: 1
  },
  epicLeaderTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  epicLeaderSubtitle: {
    color: '#FEF3C7',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16
  },
  epicLeaderArrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4
  },
  epicLeaderArrowEmoji: {
    color: '#92400E',
    fontSize: 16,
    fontWeight: '900'
  },
  statsCardContainer: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card
  },
  statsTopSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(99, 102, 241, 0.5)'
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  statsHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  statsIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statsHeaderEmoji: {
    fontSize: 18
  },
  statsHeaderEyebrow: {
    color: '#818CF8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 1
  },
  statsHeaderTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900'
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8
  },
  statItemCard: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center'
  },
  statCardGold: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.4)'
  },
  statCardCyan: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.4)'
  },
  statCardPurple: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.4)'
  },
  statCardIcon: {
    fontSize: 14,
    marginBottom: 4
  },
  statItemValue: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2
  },
  statValueGold: {
    color: '#FBBF24'
  },
  statValueCyan: {
    color: '#38BDF8'
  },
  statValuePurple: {
    color: '#C084FC'
  },
  statItemLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700'
  },
  guestStatsPrompt: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center'
  },
  guestStatsTitle: {
    color: '#F3F4F6',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center'
  },
  guestStatsText: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 12
  },
  guestLoginBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1.5,
    borderColor: '#818CF8',
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 9,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3
  },
  guestLoginBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  helpModalCard: {
    width: '100%',
    maxHeight: '84%',
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.45)',
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card
  },
  modalTopSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(167, 139, 250, 0.7)'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  modalHeaderTitleWrap: {
    flex: 1,
    marginRight: 10
  },
  modalBadgeRow: {
    marginBottom: 2
  },
  modalBadgeText: {
    color: '#818CF8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  modalTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900'
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCloseBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '800'
  },
  modalContent: {
    marginBottom: 14
  },
  helpStepCard: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    alignItems: 'flex-start'
  },
  stepCardIndigo: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderColor: 'rgba(99, 102, 241, 0.3)'
  },
  stepCardCyan: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderColor: 'rgba(6, 182, 212, 0.3)'
  },
  stepCardEmerald: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  stepCardPink: {
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    borderColor: 'rgba(236, 72, 153, 0.3)'
  },
  stepCardAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  helpStepBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1
  },
  badgeIndigo: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderColor: '#818CF8'
  },
  badgeCyan: {
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
    borderColor: '#38BDF8'
  },
  badgeEmerald: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: '#34D399'
  },
  badgePink: {
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
    borderColor: '#F472B6'
  },
  badgeAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: '#FBBF24'
  },
  helpStepBadgeText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 12
  },
  helpStepBody: {
    flex: 1
  },
  helpStepTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3
  },
  helpStepDesc: {
    color: '#D1D5DB',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '500'
  },
  modalPrimaryBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: radii.xl,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.6)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4
  },
  modalPrimaryBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5
  }
});
