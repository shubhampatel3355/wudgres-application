import React, { useRef } from 'react';
import { View, Text, ImageBackground, Pressable, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

interface SeriesCardProps {
    image: any;
    name: string;
    onPress?: () => void;
    height?: number | string;
    imageResizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ image, name, onPress, height, imageResizeMode }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View style={[styles.container, height ? { height } : null, { transform: [{ scale: scaleAnim }] }]}>
                <ImageBackground source={image} style={styles.background} resizeMode={imageResizeMode || "contain"}>
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)']}
                        style={styles.gradient}
                    >
                        <Text style={styles.name}>{name}</Text>
                    </LinearGradient>
                </ImageBackground>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 160,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        marginBottom: theme.spacing.md,
        backgroundColor: '#000000', // Added to blend with contained images
    },
    background: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: theme.spacing.md,
    },
    name: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.lg,
        fontFamily: 'Unbounded_700Bold',
    },
});
