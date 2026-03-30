import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';

const CATEGORIES = [
  { id: 'vehicles', name: 'ยานพาหนะ', nameEn: 'Vehicles', color: '#FF6B6B', emoji: '🚗' },
  { id: 'animals', name: 'สัตว์', nameEn: 'Animals', color: '#4ECDC4', emoji: '🐘' },
  { id: 'musical_instruments', name: 'เครื่องดนตรี', nameEn: 'Musical Instruments', color: '#9B59B6', emoji: '🎸' },
];

export default function CategoryScreen({ navigation }) {
  const handleSelectCategory = (category) => {
    navigation.navigate('Difficulty', { category });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      <View style={styles.header}>
        <Text style={styles.emoji}>📂</Text>
        <Text style={styles.title}>เลือกหมวดหมู่</Text>
        <Text style={styles.subtitle}>เลือกหมวดหมู่ที่คุณต้องการเล่น</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: category.color }]}
              onPress={() => handleSelectCategory(category)}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryNameEn}>{category.nameEn}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← กลับไปหน้าหลัก</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  emoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#BDC3C7',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  categoryCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    padding: 16,
  },
  categoryEmoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  categoryNameEn: {
    fontSize: 12,
    color: '#2C3E50',
    opacity: 0.8,
    marginTop: 4,
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 16,
    backgroundColor: '#34495E',
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
