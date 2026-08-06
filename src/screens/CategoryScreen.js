import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { colors, radii, shadows } from '../theme/appTheme';

const CATEGORIES = [
  { id: 'vehicles', name: 'ยานพาหนะ', nameEn: 'Vehicles', color: '#FF7A59', emoji: '🚗', description: 'รูปภาพและเสียงเกี่ยวกับการเดินทางรอบตัว' },
  { id: 'animals', name: 'สัตว์', nameEn: 'Animals', color: '#3CD3B2', emoji: '🐘', description: 'เดาคำศัพท์จากสัตว์ใกล้ตัวและสัตว์น่ารู้' },
  { id: 'musical_instruments', name: 'เครื่องดนตรี', nameEn: 'Musical Instruments', color: '#A56DFF', emoji: '🎸', description: 'ฝึกทายชื่อเครื่องดนตรีจากสื่อผสม' },
];

export default function CategoryScreen({ navigation }) {
  const handleSelectCategory = (category) => {
    navigation.navigate('Difficulty', { category });
  };

  return (
    <ScreenShell accentColor={colors.warning} secondaryAccentColor={colors.accentSecondary}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>STEP 1 OF 2</Text>
        <Text style={styles.title}>เลือกหมวดหมู่ที่ใช่สำหรับรอบนี้</Text>
        <Text style={styles.subtitle}>แต่ละหมวดถูกออกแบบให้มีคาแรกเตอร์ต่างกัน ทั้งสี อารมณ์ และความรู้สึกในการเล่น</Text>
      </View>

      {CATEGORIES.map((category, index) => (
        <TouchableOpacity
          key={category.id}
          style={[styles.categoryCard, { borderColor: `${category.color}55` }]}
          onPress={() => handleSelectCategory(category)}
          activeOpacity={0.92}
        >
          <View style={styles.categoryTopRow}>
            <View style={[styles.iconWrap, { backgroundColor: `${category.color}22` }]}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            </View>
            <View style={styles.badgesRow}>
              <View style={[styles.tag, { backgroundColor: `${category.color}22` }]}>
                <Text style={[styles.tagText, { color: category.color }]}>หมวด {index + 1}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryNameEn}>{category.nameEn}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>แตะเพื่อเลือกระดับความยาก</Text>
            <Text style={[styles.footerArrow, { color: category.color }]}>→</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.9}
      >
        <Text style={styles.backButtonText}>กลับไปหน้าก่อนหน้า</Text>
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
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    ...shadows.soft
  },
  categoryTopRow: {
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
  badgesRow: {
    flexDirection: 'row'
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800'
  },
  categoryEmoji: {
    fontSize: 22
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4
  },
  categoryNameEn: {
    fontSize: 11,
    color: colors.accentSecondary,
    fontWeight: '700',
    marginBottom: 8
  },
  categoryDescription: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  footerText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600'
  },
  footerArrow: {
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
