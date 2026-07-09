import React from 'react';
import { View, StyleSheet } from 'react-native';

interface DoorsIconProps {
    size?: number;
    color?: string;
}

export const DoorsIcon: React.FC<DoorsIconProps> = ({ size = 24, color = '#FFFFFF' }) => {
    const doorWidth = size * 0.22;
    const doorHeight = size * 0.75;
    const spacing = size * 0.08;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Left door - angled */}
            <View
                style={[
                    styles.door,
                    {
                        width: doorWidth,
                        height: doorHeight,
                        backgroundColor: color,
                        transform: [{ skewY: '-5deg' }],
                    },
                ]}
            />
            {/* Center door - straight */}
            <View
                style={[
                    styles.door,
                    {
                        width: doorWidth,
                        height: doorHeight,
                        backgroundColor: color,
                        marginHorizontal: spacing,
                    },
                ]}
            />
            {/* Right door - angled */}
            <View
                style={[
                    styles.door,
                    {
                        width: doorWidth,
                        height: doorHeight,
                        backgroundColor: color,
                        transform: [{ skewY: '5deg' }],
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    door: {
        borderRadius: 2,
    },
});
