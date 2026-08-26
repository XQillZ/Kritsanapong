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
  { 
    id: 'vehicles', 
    name: 'ยานพาหนะ', 
    nameEn: 'Vehicles & Transport', 
    color: '#FF7A59', 
    emoji: '🚗', 
    description: 'ทดสอบความเร็วและสายตา กับรูปภาพและเสียงยานพาหนะรอบตัว' 
  },
  { 
    id: 'animals', 
    name: 'สัตว์โลกน่ารู้', 
    nameEn: 'Animals & Wildlife', 
    color: '#3CD3B2', 
    emoji: '🐘', 
    description: 'ผจญภัยในแดนสัตว์ป่าและสัตว์เลี้ยง ทายชื่อและเสียงสุดท้าทาย' 
  },
  { 
    id: 'musical_instruments', 
    name: 'เครื่องดนตรี', 
    nameEn: 'Musical Instruments', 
    color: '#A56DFF', 
    emoji: '🎸', 
    description: 'ฟังเสียงเมโลดี้และดูภาพเครื่องดนตรีสากลและพื้นบ้าน' 
  },
];

export default function CategoryScreen({ navigation }) {
  const handleSelectCategory = (category) => {
    navigation.navigate('Difficulty', { category });
  };

  return (
    <ScreenShell accentColor="#F59E0B" secondaryAccentColor="#6366F1">
      {/* Epic Step Header */}
      <View style={styles.heroCard}>
        <View style={styles.heroGlowSheen} />
        <View style={styles.badgeRow}>
          <Text style={styles.eyebrow}>⚡ STEP 01 / 02 • CHOOSE ARENA</Text>
        </View>
        <Text style={styles.title}>เลือกหมวดหมู่คำถาม</Text>
        <Text style={styles.subtitle}>เลือกสนามประลองที่คุณถนัดที่สุด แต่ละหมวดมีสื่อภาพและเสียงให้ลุ้น 10 ข้อ</Text>
      </View>

      {/* Category Cards */}
      {CATEGORIES.map((category, index) => (
        <TouchableOpacity
          key={category.id}
          style={[styles.categoryCard, { borderColor: `${category.color}66` }]}
          onPress={() => handleSelectCategory(category)}
          activeOpacity={0.9}
        >
          {/* Card Top Sheen */}
          <View style={[styles.cardTopSheen, { backgroundColor: category.color }]} />

          <View style={styles.categoryTopRow}>
            <View style={[styles.iconWrap, { backgroundColor: `${category.color}25`, borderColor: category.color }]}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            </View>
            <View style={styles.badgesRow}>
              <View style={[styles.tag, { backgroundColor: `${category.color}20`, borderColor: `${category.color}50` }]}>
                <Text style={[styles.tagText, { color: category.color }]}>หมวดที่ 0{index + 1}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={[styles.categoryNameEn, { color: category.color }]}>{category.nameEn.toUpperCase()}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>แตะเพื่อเลือกระดับความยาก</Text>
            <View style={[styles.arrowCircle, { backgroundColor: `${category.color}25`, borderColor: category.color }]}>
              <Text style={[styles.footerArrow, { color: category.color }]}>➔</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Back Action Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.88}
      >
        <Text style={styles.backButtonText}>← ย้อนกลับหน้าหลัก</Text>
      </TouchableOpacity>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.45)',
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
    backgroundColor: 'rgba(245, 158, 11, 0.75)'
  },
  badgeRow: {
    marginBottom: 4
  },
  eyebrow: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 12,
    color: '#D1D5DB',
    lineHeight: 18,
    fontWeight: '500'
  },
  categoryCard: {
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
  categoryTopRow: {
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
  badgesRow: {
    flexDirection: 'row'
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1
  },
  tagText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  categoryEmoji: {
    fontSize: 24
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 2
  },
  categoryNameEn: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  categoryDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    fontWeight: '500'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
  },
  footerText: {
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
  footerArrow: {
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
