import React, { useRef } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

interface CategoryCardProps {
    image: any;
    name: string;
    onPress?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ image, name, onPress }) => {
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
                    <Image source={image} style={styles.image} resizeMode="cover" />
                </View>
                <Text style={styles.name}>{name}</Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    imageContainer: {
        width: 120,
        height: 145,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        backgroundColor: theme.colors.backgroundLight,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    name: {
        marginTop: theme.spacing.xs,
        fontSize: theme.fontSize.sm,
        fontFamily: 'Unbounded_400Regular',
        color: theme.colors.textDark,
        textAlign: 'center',
        maxWidth: 120,
    },
});
