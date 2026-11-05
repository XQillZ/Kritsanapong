import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './theme/appTheme';

// 7 Screens as requested: Home, Login, Register, Game, Category, Result, Leaderboard
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CategoryScreen from './screens/CategoryScreen';
import DifficultyScreen from './screens/DifficultyScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import AdminScreen from './screens/AdminScreen';

const Stack = createNativeStackNavigator();
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.borderStrong,
    primary: colors.accent
  }
};

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        const isAdmin = await AsyncStorage.getItem('isAdmin');
        if (isAdmin === 'true') {
          setInitialRoute('Admin');
        } else {
          setInitialRoute(user ? 'Home' : 'Login');
        }
      } catch (e) {
        setInitialRoute(user ? 'Home' : 'Login');
      } finally {
        setIsBooting(false);
      }
    });

    return unsubscribe;
  }, []);

  if (isBooting) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
          <StatusBar style="light" />
          <ActivityIndicator size="large" color={colors.accentSecondary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.background} />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right'
          }}
        >
          {/* 1. Home */}
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
          />
          {/* 2. Login */}
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
          />
          {/* 3. Register */}
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
          />
          {/* 4. Category */}
          <Stack.Screen 
            name="Category" 
            component={CategoryScreen}
          />
          {/* 4.5 Difficulty */}
          <Stack.Screen 
            name="Difficulty" 
            component={DifficultyScreen}
          />
          {/* 5. Game */}
          <Stack.Screen 
            name="Game" 
            component={GameScreen}
          />
          {/* 6. Result */}
          <Stack.Screen 
            name="Result" 
            component={ResultScreen}
          />
          {/* 7. Leaderboard */}
          <Stack.Screen 
            name="Leaderboard" 
            component={LeaderboardScreen}
          />
          {/* 8. Admin */}
          <Stack.Screen 
            name="Admin" 
            component={AdminScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
