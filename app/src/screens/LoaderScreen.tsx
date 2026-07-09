import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

interface LoaderScreenProps {
  navigation: any;
}

export const LoaderScreen: React.FC<LoaderScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/images/video/loader.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isMuted
        onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
          if (status.isLoaded && status.didJustFinish) {
            navigation.replace('Main');
          }
        }}
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
