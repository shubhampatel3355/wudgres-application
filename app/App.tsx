import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import NetworkOverlay from './src/components/NetworkOverlay';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { WishlistProvider } from './src/context/WishlistContext';
import { HomeProvider } from './src/context/HomeContext';
import { useFonts } from 'expo-font';
import { View, Text, LogBox } from 'react-native';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
]);
import { useEffect } from 'react';
import { supabase } from './src/lib/supabase';
import { registerForPushNotificationsAsync } from './src/lib/notifications';

export default function App() {
  let [fontsLoaded] = useFonts({
    'Gilroy-Regular': require('./assets/fonts/Gilroy-Regular.ttf'),
    'Gilroy-Bold': require('./assets/fonts/Gilroy-Bold.ttf'),
  });

  useEffect(() => {
    let pushToken: string | null | undefined = null;
    let currentSession: any = null;
    
    async function setupNotifications() {
      try {
        pushToken = await registerForPushNotificationsAsync();
        if (pushToken && currentSession?.user) {
          await supabase
            .from('profiles')
            .update({ expo_push_token: pushToken })
            .eq('id', currentSession.user.id);
        }
      } catch (err) {
        console.error('Error setting up push notifications', err);
      }
    }
    
    setupNotifications();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      currentSession = session;
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
    <ErrorBoundary>
      <SafeAreaProvider>
        <HomeProvider>
          <WishlistProvider>
            <StatusBar style="light" />
            <AppNavigator />
            <NetworkOverlay />
          </WishlistProvider>
        </HomeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
