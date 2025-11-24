import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) =>         <MaterialCommunityIcons name="home" size={28} color={color} />
,
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: 'Dados',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-grid-plus" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="resume"
        options={{
          title: 'Relatório',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="star-four-points" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Eu',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
