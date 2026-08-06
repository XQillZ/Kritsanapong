import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ScreenShell from '../components/ScreenShell';
import { auth, db } from '../services/firebase';
import { categoryMeta, colors, radii, shadows } from '../theme/appTheme';

const CATEGORIES = [
  { id: 'vehicles', name: 'ยานพาหนะ', nameEn: 'Vehicles', color: '#FF7A59', description: 'รูปภาพและเสียงเกี่ยวกับการเดินทาง' },
  { id: 'animals', name: 'สัตว์', nameEn: 'Animals', color: '#3CD3B2', description: 'เดาคำจากสัตว์ใกล้ตัวและสัตว์น่าสนใจ' },
  { id: 'musical_instruments', name: 'เครื่องดนตรี', nameEn: 'Musical', color: '#A56DFF', description: 'ทายชื่อเครื่องดนตรีจากสื่อผสม' }
];

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
          } else {
            setUsername(currentUser.displayName || 'Player');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUsername(currentUser.displayName || 'Player');
        }
      } else {
        setUsername('Guest');
      }
    };

    // Listen to auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUsername();
      } else {
        setUsername('Guest');
      }
    });

    return () => unsubscribe();
  }, []);

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
      <View style={styles.topBar}>
        <View style={styles.identityPill}>
          <Text style={styles.identityLabel}>{auth.currentUser ? 'สมาชิก' : 'ผู้เยี่ยมชม'}</Text>
          <Text style={styles.identityValue}>สวัสดี, {username}</Text>
        </View>
        <TouchableOpacity style={styles.outlinePill} onPress={() => navigation.navigate('Leaderboard')}>
          <Text style={styles.outlinePillText}>อันดับ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>SMART MULTIMEDIA QUIZ</Text>
        <Text style={styles.heroTitle}>AI Guess Game</Text>
        <Text style={styles.heroSubtitle}>
          เกมทายคำแบบสื่อผสมที่ออกแบบให้เล่นง่าย ลื่นไหล และมีระบบคำใบ้อัจฉริยะช่วยระหว่างเกม
        </Text>
        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaText}>3 หมวด</Text>
          </View>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaText}>2 ระดับ</Text>
          </View>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaText}>AI Hint</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryAction} onPress={handleStartGame} activeOpacity={0.9}>
        <View style={styles.actionIconWrap}>
          <Text style={styles.actionIcon}>🚀</Text>
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>เริ่มเล่นเกม</Text>
          <Text style={styles.actionSubtitle}>เลือกหมวดหมู่ เลือกระดับความยาก และเข้าสู่โหมดตอบคำถามทันที</Text>
        </View>
        <Text style={styles.actionArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.dualActionsRow}>
        <TouchableOpacity
          style={[styles.secondaryAction, styles.leftAction]}
          onPress={() => navigation.navigate('Leaderboard')}
          activeOpacity={0.9}
        >
          <Text style={styles.secondaryEmoji}>🏆</Text>
          <Text style={styles.secondaryTitle}>ตารางคะแนน</Text>
          <Text style={styles.secondaryText}>ดูผู้เล่นที่ทำคะแนนสูงสุด</Text>
        </TouchableOpacity>

        {auth.currentUser ? (
          <TouchableOpacity style={[styles.secondaryAction, styles.rightAction]} onPress={handleLogout} activeOpacity={0.9}>
            <Text style={styles.secondaryEmoji}>🚪</Text>
            <Text style={styles.secondaryTitle}>ออกจากระบบ</Text>
            <Text style={styles.secondaryText}>สลับบัญชีหรือออกจากเซสชันปัจจุบัน</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.secondaryAction, styles.rightAction]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.9}
          >
            <Text style={styles.secondaryEmoji}>👤</Text>
            <Text style={styles.secondaryTitle}>เข้าสู่ระบบ</Text>
            <Text style={styles.secondaryText}>บันทึกคะแนนและแข่งขันบนลีดเดอร์บอร์ด</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>หมวดเด่นของเกม</Text>
        <Text style={styles.sectionSubtitle}>เลือกหมวดที่ต้องการและเริ่มเล่นได้ทันทีในสไตล์ที่สม่ำเสมอทั้งแอป</Text>
      </View>

      {CATEGORIES.map((category) => {
        const meta = categoryMeta[category.id];
        return (
          <View key={category.id} style={[styles.previewCard, { borderColor: `${category.color}55` }]}>
            <View style={[styles.previewIconWrap, { backgroundColor: `${category.color}22` }]}>
              <Text style={styles.previewIcon}>{meta?.icon || '✨'}</Text>
            </View>
            <View style={styles.previewContent}>
              <Text style={styles.previewTitle}>{category.name}</Text>
              <Text style={styles.previewSubtitle}>{category.nameEn}</Text>
              <Text style={styles.previewDescription}>{category.description}</Text>
            </View>
            <View style={[styles.previewBadge, { backgroundColor: `${category.color}22` }]}>
              <Text style={[styles.previewBadgeText, { color: category.color }]}>พร้อมเล่น</Text>
            </View>
          </View>
        );
      })}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
    gap: 10
  },
  identityPill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  identityLabel: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 2
  },
  identityValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700'
  },
  outlinePill: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  outlinePillText: {
    color: colors.text,
    fontWeight: '700'
  },
  heroCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 14,
    ...shadows.card
  },
  heroEyebrow: {
    color: colors.accentSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  heroTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    marginBottom: 6
  },
  heroSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  heroMetaPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  heroMetaText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '700'
  },
  sectionHeader: {
    marginBottom: 10
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.xl,
    padding: 16,
    marginBottom: 12,
    ...shadows.card
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  actionIcon: {
    fontSize: 22
  },
  actionContent: {
    flex: 1
  },
  actionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4
  },
  actionSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    lineHeight: 18
  },
  actionArrow: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 8
  },
  dualActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 124,
    ...shadows.soft
  },
  leftAction: {
    backgroundColor: 'rgba(247, 215, 116, 0.12)'
  },
  rightAction: {
    backgroundColor: 'rgba(124, 92, 255, 0.12)'
  },
  secondaryEmoji: {
    fontSize: 22,
    marginBottom: 10
  },
  secondaryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4
  },
  secondaryText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 13,
    marginBottom: 10,
    ...shadows.soft
  },
  previewIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  previewIcon: {
    fontSize: 22
  },
  previewContent: {
    flex: 1
  },
  previewTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800'
  },
  previewSubtitle: {
    color: colors.accentSecondary,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 4,
    fontWeight: '700'
  },
  previewDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17
  },
  previewBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    marginLeft: 8
  },
  previewBadgeText: {
    fontSize: 11,
    fontWeight: '800'
  }
});
