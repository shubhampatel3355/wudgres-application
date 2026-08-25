import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';

interface LoaderScreenProps {
  navigation: any;
}

export const LoaderScreen: React.FC<LoaderScreenProps> = ({ navigation }) => {
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
          return 'Main';
        } else {
          return 'Login';
        }
      } catch {
        return 'Login';
      }
    };

    // Minimum 1.5s for splash brand feel, then navigate as soon as auth is ready
    const minDelay = new Promise<void>(resolve => setTimeout(resolve, 1500));
    Promise.all([checkSession(), minDelay]).then(([screen]) => {
      navigate(screen);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/images/video/loader.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isMuted
        isLooping={false}
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

