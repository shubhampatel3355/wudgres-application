import React, { useRef } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Dimensions, Animated } from 'react-native';
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
            <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.imageContainer}>
                    <Image source={image} style={styles.image} resizeMode={imageResizeMode || "cover"} />
                </View>
                <Text style={styles.name}>{name}</Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: theme.spacing.md,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1.1,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    name: {
        marginTop: theme.spacing.sm,
        fontSize: theme.fontSize.md,
        fontFamily: 'Gilroy-Medium',
        color: theme.colors.textDark,
        textAlign: 'center',
    },
});
