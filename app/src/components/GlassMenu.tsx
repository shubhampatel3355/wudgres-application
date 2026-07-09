import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { backgroundImages } from '../data/mockData';

const { width, height } = Dimensions.get('window');

interface GlassMenuProps {
    isVisible: boolean;
    onClose: () => void;
    onNavigate: (screen: string) => void;
}

interface MenuItemProps {
    label: string;
    onPress: () => void;
    delay: number;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, onPress, delay }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
                <Text style={styles.menuItemText}>{label}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

import { useNavigation } from '@react-navigation/native';

export const GlassMenu: React.FC<GlassMenuProps> = ({ isVisible, onClose, onNavigate }) => {
    const insets = useSafeAreaInsets();
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation<any>();

    useEffect(() => {
        if (isVisible) {
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible]);

    const handleNavigation = (screen: string) => {
        onClose();
        // Use the 'Main' navigator as the base so nested screens can always find the tabs
        if (screen === 'Home') {
            navigation.navigate('Main', { screen: 'HomeStack', params: { screen: 'Home' } });
        } else if (screen === 'Products') {
            navigation.navigate('Main', { screen: 'ProductsStack', params: { screen: 'AllProducts' } });
        } else if (screen === 'Category') {
            navigation.navigate('Main', { screen: 'HomeStack', params: { screen: 'DoorsCategory' } });
        } else if (screen === 'Stores') {
            navigation.navigate('Main', { screen: 'Stores' });
        } else if (screen === 'Profile') {
            navigation.navigate('Main', { screen: 'Profile' });
        } else {
            navigation.navigate(screen);
        }
    };

    if (!isVisible) return null;

    const menuItems = [
        { label: 'Home', screen: 'Home' },
        { label: 'Products', screen: 'Products' },
        { label: 'Find A Dealer', screen: 'Stores' },
        { label: 'Wishlist', screen: 'Wishlist' },
        { label: 'Profile', screen: 'Profile' },
    ]; 

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Full screen blur overlay */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]}>
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
                    <TouchableOpacity
                        style={styles.fullScreenContainer}
                        activeOpacity={1}
                        onPress={onClose}
                    >
                        <View style={styles.overlay}>
                            {/* Full screen menu content */}
                            <View style={[styles.menuContent, { paddingTop: insets.top + 100 }]}>
                                {menuItems.map((item, index) => (
                                    <MenuItem
                                        key={item.label}
                                        label={item.label}
                                        delay={index * 150}
                                        onPress={() => handleNavigation(item.screen)}
                                    />
                                ))}
                            </View>

                            {/* Footer */}
                            <Animated.View style={[styles.footer, { paddingBottom: insets.bottom + 90, opacity: overlayOpacity }]}>
                                {/* Social Links */}
                                <View style={styles.socialLinks}>
                                    <TouchableOpacity style={styles.socialIcon}>
                                        <Ionicons name="logo-instagram" size={24} color="#ffffff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialIcon}>
                                        <Ionicons name="logo-facebook" size={24} color="#ffffff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialIcon}>
                                        <Ionicons name="logo-whatsapp" size={24} color="#ffffff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialIcon}>
                                        <Ionicons name="call-outline" size={24} color="#ffffff" />
                                    </TouchableOpacity>
                                </View>

                                {/* Brand */}
                                <View style={styles.brandContainer}>
                                    <TouchableOpacity
                                        onPress={() => handleNavigation('Home')}
                                        activeOpacity={0.7}
                                    >
                                        <Image
                                            source={require('../assets/images/footer_logo.png')}
                                            style={styles.footerLogo}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </View>
                    </TouchableOpacity>
                </BlurView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    menuContent: {
        flex: 1,
        paddingHorizontal: 32,
    },
    menuItem: {
        paddingVertical: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ffffff9f',
    },
    menuItemText: {
        fontSize: 22,
        fontFamily: 'Unbounded_500Medium',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    footer: {
        paddingHorizontal: 32,
        paddingTop: 24,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    socialLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    socialIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    brandText: {
        fontSize: 20,
        fontFamily: 'Unbounded_700Bold',
        color: '#ffffff',
        letterSpacing: 2,
    },
    footerLogo: {
        width: 210,
        height: 100,
    },
    brandDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginLeft: 4,
    },
    tagline: {
        fontSize: 14,
        fontFamily: 'Unbounded_400Regular',
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginBottom: 8,
    },
    copyright: {
        fontSize: 12,
        fontFamily: 'Unbounded_400Regular',
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
    },
});
