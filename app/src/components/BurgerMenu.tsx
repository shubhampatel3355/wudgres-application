import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface BurgerMenuProps {
    size?: number;
    color?: string;
    onPress?: () => void;
    isOpen?: boolean; // Controlled state from parent
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({
    size = 24,
    color = theme.colors.textPrimary,
    onPress,
    isOpen: controlledIsOpen,
}) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    // Use controlled state if provided, otherwise use internal state
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

    // Animation values for clean X transformation
    const topLineRotation = useRef(new Animated.Value(0)).current;
    const topLineTranslateY = useRef(new Animated.Value(0)).current;

    const middleLineOpacity = useRef(new Animated.Value(1)).current;

    const bottomLineRotation = useRef(new Animated.Value(0)).current;
    const bottomLineTranslateY = useRef(new Animated.Value(0)).current;

    // Animate when isOpen changes
    useEffect(() => {
        const lineSpacing = size / 3;

        Animated.parallel([
            // Top line: move down and rotate 45deg
            Animated.timing(topLineRotation, {
                toValue: isOpen ? 45 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(topLineTranslateY, {
                toValue: isOpen ? lineSpacing : 0,
                duration: 300,
                useNativeDriver: true,
            }),

            // Middle line: fade out
            Animated.timing(middleLineOpacity, {
                toValue: isOpen ? 0 : 1,
                duration: 300,
                useNativeDriver: true,
            }),

            // Bottom line: move up and rotate -45deg
            Animated.timing(bottomLineRotation, {
                toValue: isOpen ? -45 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(bottomLineTranslateY, {
                toValue: isOpen ? -lineSpacing : 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isOpen, size]);

    const handlePress = () => {
        if (controlledIsOpen === undefined) {
            setInternalIsOpen(!internalIsOpen);
        }
        onPress?.();
    };

    const lineHeight = 2;
    const lineSpacing = size / 3;

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            style={[styles.container, { width: size, height: size }]}
        >
            {/* Top line */}
            <Animated.View
                style={[
                    styles.line,
                    {
                        width: size,
                        height: lineHeight,
                        backgroundColor: color,
                        transform: [
                            { translateY: topLineTranslateY },
                            {
                                rotate: topLineRotation.interpolate({
                                    inputRange: [0, 45],
                                    outputRange: ['0deg', '45deg'],
                                }),
                            },
                        ],
                    },
                ]}
            />

            {/* Middle line */}
            <Animated.View
                style={[
                    styles.line,
                    {
                        width: size,
                        height: lineHeight,
                        backgroundColor: color,
                        marginVertical: lineSpacing - lineHeight,
                        opacity: middleLineOpacity,
                    },
                ]}
            />

            {/* Bottom line */}
            <Animated.View
                style={[
                    styles.line,
                    {
                        width: size,
                        height: lineHeight,
                        backgroundColor: color,
                        transform: [
                            { translateY: bottomLineTranslateY },
                            {
                                rotate: bottomLineRotation.interpolate({
                                    inputRange: [-45, 0],
                                    outputRange: ['-45deg', '0deg'],
                                }),
                            },
                        ],
                    },
                ]}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    line: {
        borderRadius: 2,
    },
});
