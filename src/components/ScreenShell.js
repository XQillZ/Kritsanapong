import React from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/appTheme';

export default function ScreenShell({
  children,
  scroll = true,
  style,
  contentContainerStyle,
  accentColor = colors.accent,
  secondaryAccentColor = colors.accentSecondary,
  statusBarStyle = 'light-content'
}) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, style]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={colors.background} />
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={[styles.primaryGlow, { backgroundColor: accentColor }]} />
        <View style={[styles.secondaryGlow, { backgroundColor: secondaryAccentColor }]} />
        <View style={styles.bottomGlow} />
      </View>
      {scroll ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden'
  },
  primaryGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -70,
    right: -40,
    opacity: 0.18
  },
  secondaryGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: 120,
    left: -80,
    opacity: 0.15
  },
  bottomGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    bottom: -180,
    alignSelf: 'center',
    backgroundColor: '#173D68',
    opacity: 0.28
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 24
  },
  scrollView: {
    flex: 1
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 16
  }
});
