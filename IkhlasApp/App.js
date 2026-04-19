import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { colors } from './src/theme/colors';
import { storage } from './src/utils/storage';

import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { DonationsScreen } from './src/screens/DonationsScreen';
import { AddDonationScreen } from './src/screens/AddDonationScreen';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { VersesScreen } from './src/screens/VersesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({ name, focused, color }) => (
  <Ionicons name={focused ? name : `${name}-outline`} size={22} color={color} />
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        paddingBottom: 6,
        paddingTop: 6,
        height: 62,
      },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}
  >
    <Tab.Screen
      name="Home"
      component={DashboardScreen}
      options={{ tabBarIcon: (props) => <TabIcon name="home" {...props} />, tabBarLabel: 'Home' }}
    />
    <Tab.Screen
      name="Donations"
      component={DonationsScreen}
      options={{ tabBarIcon: (props) => <TabIcon name="wallet" {...props} />, tabBarLabel: 'Donations' }}
    />
    <Tab.Screen
      name="Calculator"
      component={CalculatorScreen}
      options={{ tabBarIcon: (props) => <TabIcon name="calculator" {...props} />, tabBarLabel: 'Calculator' }}
    />
    <Tab.Screen
      name="Verses"
      component={VersesScreen}
      options={{ tabBarIcon: (props) => <TabIcon name="book" {...props} />, tabBarLabel: 'Verses' }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ tabBarIcon: (props) => <TabIcon name="settings" {...props} />, tabBarLabel: 'Settings' }}
    />
  </Tab.Navigator>
);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const navigationRef = useRef(null);

  useEffect(() => {
    storage.isOnboarded().then(v => {
      setOnboarded(v);
      setLoading(false);
    });

    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen && navigationRef.current) {
        navigationRef.current.navigate(screen);
      }
    });
    return () => sub.remove();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!onboarded) {
    return <OnboardingScreen onComplete={() => setOnboarded(true)} />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="AddDonation"
          component={AddDonationScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
});
