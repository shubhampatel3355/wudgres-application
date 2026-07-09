import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Feather } from '@expo/vector-icons';

const NetworkOverlay = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // isConnected is true when connected to a network.
      // isInternetReachable is true when the network has actual internet access.
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsConnected(!offline);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRetry = () => {
    NetInfo.refresh().then(state => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsConnected(!offline);
    });
  };

  // Do not render anything if connected
  if (isConnected) return null;

  return (
    <Modal visible={!isConnected} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Feather name="wifi-off" size={48} color="#D4AF37" style={{ marginBottom: 16 }} />
          <Text style={styles.title}>No Connection</Text>
          <Text style={styles.subtitle}>
            Please check your internet connection and try again.
          </Text>
          
          <TouchableOpacity style={styles.button} onPress={handleRetry} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 26, 23, 0.95)', // Deep warm dark with high opacity
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#24221D', // bg-secondary
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)', // border-color
  },
  title: {
    fontFamily: 'Unbounded_600SemiBold',
    fontSize: 20,
    color: '#F0EBE1', // text-primary
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Unbounded_400Regular',
    fontSize: 14,
    color: '#8F8877', // text-muted
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#D4AF37', // accent-gold
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Unbounded_600SemiBold',
    fontSize: 14,
    color: '#000000',
  }
});

export default NetworkOverlay;
