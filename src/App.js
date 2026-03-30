import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 7 Screens as requested: Home, Login, Register, Game, Category, Result, Leaderboard
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CategoryScreen from './screens/CategoryScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          {/* 1. Home */}
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }}
          />
          {/* 2. Login */}
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          {/* 3. Register */}
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          {/* 4. Category */}
          <Stack.Screen 
            name="Category" 
            component={CategoryScreen}
            options={{ title: 'เลือกหมวดหมู่' }}
          />
          {/* 4.5 Difficulty */}
          <Stack.Screen 
            name="Difficulty" 
            component={require('./screens/DifficultyScreen').default}
            options={{ title: 'เลือกระดับความยาก' }}
          />
          {/* 5. Game */}
          <Stack.Screen 
            name="Game" 
            component={GameScreen}
            options={{ title: 'เล่นเกม', headerBackVisible: false }}
          />
          {/* 6. Result */}
          <Stack.Screen 
            name="Result" 
            component={ResultScreen}
            options={{ title: 'ผลลัพธ์', headerBackVisible: false }}
          />
          {/* 7. Leaderboard */}
          <Stack.Screen 
            name="Leaderboard" 
            component={LeaderboardScreen}
            options={{ title: 'ตารางคะแนน' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
