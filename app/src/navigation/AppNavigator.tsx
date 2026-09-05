import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { BlurView } from 'expo-blur';

import {
    LoginScreen,
    HomeScreen,
    AllProductsScreen,
    ProductSeriesScreen,
    ProfileScreen,
    GalleryScreen,
    DoorsCategoryScreen,
    NFCCategoryScreen,
    VenDecorScreen,
    ProductDetailScreen,
    NfcDoorDetailScreen,
    NfcFrameDetailScreen,
    WindowShutterDetailScreen,
    EngineeredWoodFrameDetailScreen,
    PlywoodCategoryScreen,
    PlywoodDetailScreen,
    BlockBoardDetailScreen,
    FlushDoorDetailScreen,
    LamorousScreen,
    TimborScreen,
    LaminaScreen,
    SolidWhiteScreen,
    TeakVeneerScreen,
    MetalemScreen,
    EspialScreen,
    DivineScreen,
    EmbozzScreen,
    NfcDoorScreen,
    SearchScreen,
    StoreLocatorScreen,
    WishlistScreen,
    LoaderScreen,
    RegisterScreen,
    AccountSettingsScreen,
    SupportContactScreen,
    PrivacySecurityScreen,
    NotificationsScreen,
    DynamicCategoryScreen,
} from '../screens';
import { theme } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ProductsStack = createNativeStackNavigator();

// Active gold color from design
const ACTIVE_COLOR = '#C2A46F';
const INACTIVE_COLOR = 'rgba(255, 255, 255, 0.5)';

// Animated Tab Button Component
const TabButton = ({ route, isFocused, onPress, icon }: any) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isFocused ? 1.15 : 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
    }, [isFocused]);

    return (
        <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                {icon}
            </Animated.View>
        </TouchableOpacity>
    );
};

// Custom Tab Bar with Glassmorphism
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    return (
        <View style={styles.tabBarContainer}>
            <BlurView intensity={80} tint="dark" style={styles.blurView}>
                <View style={styles.tabBarContent}>
                    {state.routes.map((route: any, index: number) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                // Navigate to the initial route of the stack if clicking the tab
                                navigation.navigate(route.name, { screen: undefined });
                            }
                        };

                        let icon;
                        if (route.name === 'HomeStack') {
                            icon = (
                                <Image
                                    source={require('../assets/icons/home_icon.png')}
                                    style={{
                                        width: 27,
                                        height: 27,
                                        tintColor: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
                                    }}
                                    resizeMode="contain"
                                />
                            );
                        } else if (route.name === 'ProductsStack') {
                            icon = (
                                <Image
                                    source={require('../assets/icons/product_icon.png')}
                                    style={{
                                        width: 24,
                                        height: 24,
                                        tintColor: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
                                    }}
                                    resizeMode="contain"
                                />
                            );
                        } else if (route.name === 'Stores') {
                            icon = (
                                <Image
                                    source={require('../assets/icons/store_icon.png')}
                                    style={{
                                        width: 24,
                                        height: 24,
                                        tintColor: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
                                    }}
                                    resizeMode="contain"
                                />
                            );
                        } else if (route.name === 'Profile') {
                            icon = (
                                <Image
                                    source={require('../assets/icons/profile_icon.png')}
                                    style={{
                                        width: 24,
                                        height: 24,
                                        tintColor: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
                                    }}
                                    resizeMode="contain"
                                />
                            );
                        }

                        return (
                            <TabButton
                                key={route.key}
                                route={route}
                                isFocused={isFocused}
                                onPress={onPress}
                                icon={icon}
                            />
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
};

// Home Stack Navigator
const HomeStackNavigator = () => {
    return (
        <HomeStack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <HomeStack.Screen name="Home" component={HomeScreen} />
            <HomeStack.Screen name="DoorsCategory" component={DoorsCategoryScreen} />
            <HomeStack.Screen name="NFCCategory" component={NFCCategoryScreen} />
            <HomeStack.Screen name="PlywoodCategory" component={PlywoodCategoryScreen} />
            <HomeStack.Screen name="ProductSeries" component={ProductSeriesScreen} />
            <HomeStack.Screen name="Gallery" component={GalleryScreen} />
            <HomeStack.Screen name="AllProducts" component={AllProductsScreen} />
            <HomeStack.Screen name="VenDecor" component={VenDecorScreen} />
            <HomeStack.Screen name="Lamorous" component={LamorousScreen} />
            <HomeStack.Screen name="Timbor" component={TimborScreen} />
            <HomeStack.Screen name="Lamina" component={LaminaScreen} />
            <HomeStack.Screen name="SolidWhite" component={SolidWhiteScreen} />
            <HomeStack.Screen name="TeakVeneer" component={TeakVeneerScreen} />
            <HomeStack.Screen name="Metalem" component={MetalemScreen} />
            <HomeStack.Screen name="Espial" component={EspialScreen} />
            <HomeStack.Screen name="Divine" component={DivineScreen} />
            <HomeStack.Screen name="Embozz" component={EmbozzScreen} />
            <HomeStack.Screen name="NfcDoor" component={NfcDoorScreen} />
        </HomeStack.Navigator>
    );
};

// Products Stack Navigator
const ProductsStackNavigator = () => {
    return (
        <ProductsStack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <ProductsStack.Screen name="AllProducts" component={AllProductsScreen} />
            <ProductsStack.Screen name="ProductSeries" component={ProductSeriesScreen} />
            <ProductsStack.Screen name="VenDecor" component={VenDecorScreen} />
            <ProductsStack.Screen name="Lamorous" component={LamorousScreen} />
            <ProductsStack.Screen name="Timbor" component={TimborScreen} />
            <ProductsStack.Screen name="Lamina" component={LaminaScreen} />
            <ProductsStack.Screen name="SolidWhite" component={SolidWhiteScreen} />
            <ProductsStack.Screen name="TeakVeneer" component={TeakVeneerScreen} />
            <ProductsStack.Screen name="Metalem" component={MetalemScreen} />
            <ProductsStack.Screen name="Espial" component={EspialScreen} />
            <ProductsStack.Screen name="Divine" component={DivineScreen} />
            <ProductsStack.Screen name="Embozz" component={EmbozzScreen} />
            <ProductsStack.Screen name="NfcDoor" component={NfcDoorScreen} />
        </ProductsStack.Navigator>
    );
};

// Bottom Tab Navigator
const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="HomeStack"
                component={HomeStackNavigator}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="ProductsStack"
                component={ProductsStackNavigator}
                options={{ tabBarLabel: 'Products' }}
            />
            <Tab.Screen name="Stores" component={StoreLocatorScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

// Main App Navigator
export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Loader"
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Loader" component={LoaderScreen} />
                <Stack.Screen name="Main" component={BottomTabNavigator} />
                <Stack.Screen name="Wishlist" component={WishlistScreen} />
                <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
                <Stack.Screen name="SupportContact" component={SupportContactScreen} />
                <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                <Stack.Screen name="NfcDoorDetail" component={NfcDoorDetailScreen} />
                <Stack.Screen name="NfcFrameDetail" component={NfcFrameDetailScreen} />
                <Stack.Screen name="WindowShutterDetail" component={WindowShutterDetailScreen} />
                <Stack.Screen name="EngineeredWoodFrameDetail" component={EngineeredWoodFrameDetailScreen} />
                <Stack.Screen name="PlywoodDetail" component={PlywoodDetailScreen} />
                <Stack.Screen name="BlockBoardDetail" component={BlockBoardDetailScreen} />
                <Stack.Screen name="FlushDoorDetail" component={FlushDoorDetailScreen} />
                <Stack.Screen name="DynamicCategory" component={DynamicCategoryScreen} />
                <Stack.Group screenOptions={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}>
                    <Stack.Screen name="Search" component={SearchScreen} />
                </Stack.Group>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 20,
        left: 32,
        right: 32,
        height: 54,
        borderRadius: 27,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    blurView: {
        flex: 1,
        backgroundColor: 'rgba(26, 26, 26, 0.85)',
    },
    tabBarContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
});
