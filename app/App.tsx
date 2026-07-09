import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import NetworkOverlay from './src/components/NetworkOverlay';
import { WishlistProvider } from './src/context/WishlistContext';
import { 
  useFonts, 
  Unbounded_300Light,
  Unbounded_400Regular, 
  Unbounded_500Medium,
  Unbounded_600SemiBold,
  Unbounded_700Bold 
} from '@expo-google-fonts/unbounded';
import { View, Text, LogBox } from 'react-native';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
]);
import { useEffect } from 'react';
import { supabase } from './src/lib/supabase';
import { registerForPushNotificationsAsync } from './src/lib/notifications';

export default function App() {
  let [fontsLoaded] = useFonts({
    Unbounded_300Light,
    Unbounded_400Regular,
    Unbounded_500Medium,
    Unbounded_600SemiBold,
    Unbounded_700Bold,
  });

  useEffect(() => {
    let pushToken: string | null = null;
    
    async function setupNotifications() {
      try {
        pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await supabase
              .from('profiles')
              .update({ expo_push_token: pushToken })
              .eq('id', session.user.id);
          }
        }
      } catch (err) {
        console.error('Error setting up push notifications', err);
      }
    }
    
    setupNotifications();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && pushToken) {
        await supabase
          .from('profiles')
          .update({ expo_push_token: pushToken })
          .eq('id', session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <WishlistProvider>
        <StatusBar style="light" />
        <AppNavigator />
        <NetworkOverlay />
      </WishlistProvider>
    </SafeAreaProvider>
  );
}
