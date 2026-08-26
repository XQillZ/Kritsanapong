import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { colors, radii, shadows } from '../theme/appTheme';

export default function DifficultyScreen({ navigation, route }) {
  const { category } = route.params;

  const difficultyOptions = [
    {
      id: 'easy',
      title: 'โหมดง่าย (Easy)',
      subtitle: 'RELAXED & FAST-PACED',
      description: 'เหมาะสำหรับผู้เริ่มต้น คำศัพท์คุ้นเคย มีสื่อภาพและเสียงชัดเจน',
      points: '⭐ ตอบถูกได้ 1 คะแนน / ข้อ (สูงสุด 10 แต้ม)',
      hintRule: '💡 ใช้ AI คำใบ้ได้ไม่หักคะแนน',
      accent: '#10B981',
      emoji: '🌱'
    },
    {
      id: 'hard',
      title: 'โหมดยาก (Hard)',
      subtitle: 'CHALLENGING & HIGH REWARD',
      description: 'ท้าทายระดับเซียน คำถามและสื่อเสียงที่มีความซับซ้อน ได้คะแนนคูณสอง!',
      points: '⭐ ตอบถูกได้ 2 คะแนน / ข้อ (สูงสุด 20 แต้ม!)',
      hintRule: '⚠️ หากกดขอ AI คำใบ้ในข้อนั้น จะได้ 1 คะแนน',
      accent: '#EF4444',
      emoji: '🔥'
    }
  ];

  const handleSelectDifficulty = (difficulty) => {
    navigation.navigate('Game', { category, difficulty });
  };

  return (
    <ScreenShell accentColor={category?.color || '#6366F1'} secondaryAccentColor="#F59E0B">
      {/* Epic Step Header */}
      <View style={styles.heroCard}>
        <View style={styles.heroGlowSheen} />
        <View style={styles.badgeRow}>
          <Text style={styles.eyebrow}>⚡ STEP 02 / 02 • SELECT DIFFICULTY</Text>
        </View>
        <Text style={styles.title}>เลือกระดับความยาก</Text>
        <View style={styles.categorySelectedRow}>
          <Text style={styles.categorySelectedLabel}>หมวดหมู่ที่เลือก:</Text>
          <View style={[styles.categorySelectedBadge, { backgroundColor: `${category.color}25`, borderColor: category.color }]}>
            <Text style={[styles.categorySelectedText, { color: category.color }]}>{category.name}</Text>
          </View>
        </View>
      </View>

      {/* Difficulty Cards */}
      {difficultyOptions.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.difficultyCard, { borderColor: `${item.accent}66` }]}
          onPress={() => handleSelectDifficulty(item.id)}
          activeOpacity={0.9}
        >
          {/* Card Top Sheen */}
          <View style={[styles.cardTopSheen, { backgroundColor: item.accent }]} />

          <View style={styles.cardTopRow}>
            <View style={[styles.iconWrap, { backgroundColor: `${item.accent}25`, borderColor: item.accent }]}>
              <Text style={styles.difficultyEmoji}>{item.emoji}</Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: `${item.accent}20`, borderColor: `${item.accent}55` }]}>
              <Text style={[styles.levelBadgeText, { color: item.accent }]}>{item.id.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.difficultyName}>{item.title}</Text>
          <Text style={[styles.difficultySubtitle, { color: item.accent }]}>{item.subtitle}</Text>

          {/* Reward Badges */}
          <View style={styles.rewardContainer}>
            <View style={[styles.rewardBadge, { backgroundColor: `${item.accent}15`, borderColor: `${item.accent}40` }]}>
              <Text style={[styles.rewardBadgeText, { color: item.accent }]}>{item.points}</Text>
            </View>
            <Text style={styles.hintRuleText}>{item.hintRule}</Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>แตะเพื่อเริ่มเข้าสู่เกม</Text>
            <View style={[styles.arrowCircle, { backgroundColor: `${item.accent}25`, borderColor: item.accent }]}>
              <Text style={[styles.cardFooterArrow, { color: item.accent }]}>➔</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.88}
      >
        <Text style={styles.backButtonText}>← เปลี่ยนหมวดหมู่</Text>
      </TouchableOpacity>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.45)',
    padding: 16,
    marginTop: 6,
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
    backgroundColor: 'rgba(99, 102, 241, 0.75)'
  },
  badgeRow: {
    marginBottom: 4
  },
  eyebrow: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 6
  },
  categorySelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  categorySelectedLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600'
  },
  categorySelectedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1
  },
  categorySelectedText: {
    fontSize: 11,
    fontWeight: '900'
  },
  difficultyCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 12,
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
    opacity: 0.8
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5
  },
  difficultyEmoji: {
    fontSize: 24
  },
  levelBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  difficultyName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 2
  },
  difficultySubtitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  difficultyDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 12,
    fontWeight: '500'
  },
  rewardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radii.lg,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  rewardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 6
  },
  rewardBadgeText: {
    fontSize: 11.5,
    fontWeight: '900'
  },
  hintRuleText: {
    fontSize: 11,
    color: '#D1D5DB',
    fontWeight: '500'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
  },
  cardFooterText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '700'
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  cardFooterArrow: {
    fontSize: 14,
    fontWeight: '900'
  },
  backButton: {
    marginTop: 6,
    marginBottom: 10,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: radii.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  backButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800'
  },
});
