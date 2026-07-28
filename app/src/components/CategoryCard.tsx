import React, { useRef } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

interface CategoryCardProps {
    image: any;
    name: string;
    onPress?: () => void;
    layout?: 'grid' | 'full';
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ image, name, onPress, layout = 'grid' }) => {
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
            <Animated.View style={[styles.container, layout === 'full' && styles.containerFull, { transform: [{ scale: scaleAnim }] }]}>
                <View style={[styles.imageContainer, layout === 'full' && styles.imageContainerFull]}>
                    <Image source={image} style={styles.image} resizeMode="cover" />
                </View>
                <Text style={[styles.name, layout === 'full' && styles.nameFull]}>{name}</Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    containerFull: {
        width: '100%',
    },
    imageContainer: {
        width: '100%', // take full width of cell
        aspectRatio: 120 / 145, // keep original aspect ratio for grid
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    imageContainerFull: {
        width: '100%',
        aspectRatio: 2.5, // wide landscape look
    },
    image: {
        width: '100%',
        height: '100%',
    },
    name: {
        marginTop: theme.spacing.xs,
        fontSize: theme.fontSize.sm,
        fontFamily: 'Gilroy-Medium',
        color: theme.colors.textDark,
        textAlign: 'center',
        width: '100%',
    },
    nameFull: {
        fontSize: theme.fontSize.md,
    }
});
