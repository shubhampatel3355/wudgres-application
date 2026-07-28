import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { BurgerMenu } from './BurgerMenu';

interface HeaderProps {
    showBack?: boolean;
    onBackPress?: () => void;
    showNotification?: boolean;
    showMenu?: boolean;
    onMenuPress?: () => void;
    isMenuOpen?: boolean;
}

import { useNavigation } from '@react-navigation/native';

export const Header: React.FC<HeaderProps> = ({
    showBack = false,
    onBackPress,
    showNotification = true,
    showMenu = true,
    onMenuPress,
    isMenuOpen = false,
}) => {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                {showBack ? (
                    <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.logoContainer}
                        activeOpacity={0.7}
                        onPress={() => {
                            navigation.navigate('HomeStack', { screen: 'Home' });
                        }}
                    >
                        <View style={styles.logoBox}>
                            <Ionicons name="grid" size={20} color={theme.colors.textPrimary} />
                        </View>
                        <Text style={styles.brandText}>WUDGRES</Text>
                        <View style={styles.greenDot} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.rightSection}>
                {showNotification && (
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                )}
                {showMenu && (
                    <View style={[styles.iconButton, { marginLeft: 8 }]}>
                        <BurgerMenu
                            size={24}
                            color={theme.colors.primary}
                            isOpen={isMenuOpen}
                            onPress={onMenuPress}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: 'transparent',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBox: {
        width: 32,
        height: 32,
        backgroundColor: theme.colors.backgroundLight,
        borderRadius: theme.borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "transparent",
        marginRight: 8,
    },
    brandText: {
        fontSize: 18,
        fontFamily: 'Gilroy-Bold',
        color: theme.colors.textPrimary,
        letterSpacing: 1,
    },
    greenDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4CAF50',
        marginLeft: 4,
    },
    iconButton: {
        padding: theme.spacing.xs,
    },
});
