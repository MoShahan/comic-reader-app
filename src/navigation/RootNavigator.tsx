import { Text } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ComicDetailScreen } from '@/screens/ComicDetailScreen';
import { LibraryScreen } from '@/screens/LibraryScreen';
import { ReaderScreen } from '@/screens/ReaderScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { useTheme } from '@/theme';

import type { RootStackParamList, RootTabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>▣</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { colors, isDark } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: 'Fraunces_600SemiBold' },
        contentStyle: { backgroundColor: colors.bg },
        statusBarStyle: isDark ? 'light' : 'dark',
      }}
    >
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="ComicDetail" component={ComicDetailScreen} options={{ title: 'Comic' }} />
      <Stack.Screen
        name="Reader"
        component={ReaderScreen}
        options={{ headerShown: false, animation: 'fade', orientation: 'all' }}
      />
    </Stack.Navigator>
  );
}
