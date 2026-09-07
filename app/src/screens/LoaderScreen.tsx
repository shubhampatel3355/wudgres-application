import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { useHomeContext } from '../context/HomeContext';

interface LoaderScreenProps {
  navigation: any;
}

export const LoaderScreen: React.FC<LoaderScreenProps> = ({ navigation }) => {
  const { preloadHomeData } = useHomeContext();

  const player = useVideoPlayer(require('../assets/images/video/loader.mp4'), (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    let navigated = false;

    const navigate = (screen: string) => {
      if (!navigated) {
        navigated = true;
        navigation.replace(screen);
      }
    };

    const checkSession = async (): Promise<string> => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const startTimeStr = await SecureStore.getItemAsync('session_start_time');
          if (startTimeStr) {
            const startTime = parseInt(startTimeStr, 10);
            const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
            if (Date.now() - startTime > thirtyDaysInMs) {
              await supabase.auth.signOut();
              await SecureStore.deleteItemAsync('session_start_time');
              return 'Login';
            }
          }
          // Prevent hanging if network is slow
          await Promise.race([
            preloadHomeData(),
            new Promise(resolve => setTimeout(resolve, 8000))
          ]);
          return 'Main';
        } else {
          return 'Login';
        }
      } catch {
        return 'Login';
      }
    };

    // Minimum 1.5s for splash brand feel, then navigate as soon as auth is ready.
    // checkSession() itself is guarded, but the underlying supabase.auth.getSession()
    // call can hang indefinitely on some devices, so bound the whole check with a
    // hard timeout too — otherwise the app is stuck on this splash screen forever.
    const minDelay = new Promise<void>(resolve => setTimeout(resolve, 1500));
    const sessionCheck = Promise.race([
      checkSession(),
      new Promise<string>(resolve => setTimeout(() => resolve('Login'), 10000)),
    ]);
    Promise.all([sessionCheck, minDelay]).then(([screen]) => {
      navigate(screen);
    });
  }, []);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1A17',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

