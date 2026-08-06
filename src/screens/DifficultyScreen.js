import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { colors, difficultyMeta, radii, shadows } from '../theme/appTheme';

export default function DifficultyScreen({ navigation, route }) {
  const { category } = route.params;

  const difficultyOptions = [
    {
      id: 'easy',
      title: 'ง่าย (Easy)',
      description: 'เหมาะกับผู้เริ่มต้น คำศัพท์คุ้นเคย เล่นลื่นและได้จังหวะเร็ว',
      points: 'ตอบถูก 1 คะแนนต่อข้อ',
      accent: colors.success
    },
    {
      id: 'hard',
      title: 'ยาก (Hard)',
      description: 'ท้าทายกว่าเดิม ต้องคิดละเอียดขึ้น แต่ได้คะแนนต่อข้อสูงกว่า',
      points: 'ตอบถูก 2 คะแนน ใช้คำใบ้เหลือ 1',
      accent: colors.danger
    }
  ];

  const handleSelectDifficulty = (difficulty) => {
    navigation.navigate('Game', { category, difficulty });
  };

  return (
    <ScreenShell accentColor={category?.color || colors.accent} secondaryAccentColor={colors.warning}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>STEP 2 OF 2</Text>
        <Text style={styles.title}>เลือกระดับความยากของรอบนี้</Text>
        <Text style={styles.subtitle}>หมวดที่เลือก: {category.name}</Text>
        <Text style={styles.helperText}>เลือกระดับที่เหมาะกับผู้เล่นหรือรูปแบบการเดโมโปรเจกต์ที่คุณต้องการนำเสนอ</Text>
      </View>

      {difficultyOptions.map((item) => {
        const meta = difficultyMeta[item.id];
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.difficultyCard, { borderColor: `${item.accent}66` }]}
            onPress={() => handleSelectDifficulty(item.id)}
            activeOpacity={0.92}
          >
            <View style={styles.cardTopRow}>
              <View style={[styles.iconWrap, { backgroundColor: `${item.accent}22` }]}>
                <Text style={styles.difficultyEmoji}>{meta?.icon || '✨'}</Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: `${item.accent}22` }]}>
                <Text style={[styles.levelBadgeText, { color: item.accent }]}>{item.id.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.difficultyName}>{item.title}</Text>
            <Text style={styles.difficultyDesc}>{item.description}</Text>

            <View style={styles.featureRow}>
              <View style={[styles.dot, { backgroundColor: item.accent }]} />
              <Text style={styles.featureText}>{item.points}</Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText}>แตะเพื่อเริ่มเล่น</Text>
              <Text style={[styles.cardFooterArrow, { color: item.accent }]}>→</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.9}
      >
        <Text style={styles.backButtonText}>กลับไปเลือกหมวดหมู่</Text>
      </TouchableOpacity>
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
    ...shadows.card
  },
  eyebrow: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 30,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: colors.accentSecondary,
    fontWeight: '700',
    marginBottom: 6
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18
  },
  difficultyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 15,
    marginBottom: 12,
    ...shadows.soft
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  difficultyEmoji: {
    fontSize: 22
  },
  levelBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  difficultyName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8
  },
  difficultyDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 10
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  featureText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  cardFooterText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  cardFooterArrow: {
    fontSize: 22,
    fontWeight: '800'
  },
  backButton: {
    marginTop: 4,
    paddingVertical: 13,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong
  },
  backButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700'
  },
});
