import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, ScrollView, Alert, LayoutAnimation, UIManager, Platform, Linking } from "react-native";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme";
import { backgroundImages } from "../data/mockData";
import { GlassMenu, BurgerMenu } from "../components";
import { supabase } from "../lib/supabase";

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWarrantyExpanded, setIsWarrantyExpanded] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string, email: string, phone: string | null } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('name, email, phone')
            .eq('id', user.id)
            .single();
          if (data) {
            setUserProfile({
              name: data.name || "User",
              email: data.email || user.email || "No email provided",
              phone: data.phone || "No phone provided",
            });
          }
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.auth.signOut();
            } catch (err) {
              console.warn("Error signing out:", err);
            } finally {
              // Always return to Login — the user's intent is to leave the
              // account context even if the network sign-out call failed.
              navigation.replace("Login");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Wood Texture Background */}
      <ImageBackground
        source={backgroundImages.woodTexture}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            {/* Logo Row */}
            <View style={styles.headerRow}>
              <View style={styles.logoContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate("HomeStack", { screen: "Home" })
                  }
                >
                  <Image
                    source={backgroundImages.logo}
                    style={styles.headerLogo}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.headerIcons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate("Search")}
                >
                  <Ionicons
                    name="search-outline"
                    size={26}
                    color={theme.colors.textPrimary}
                  />
                </TouchableOpacity>

                <View style={styles.iconButton}>
                  <BurgerMenu
                    size={24}
                    color={theme.colors.textPrimary}
                    isOpen={isMenuOpen}
                    onPress={() => setIsMenuOpen(!isMenuOpen)}
                  />
                </View>
              </View>
            </View>

            {/* Greeting */}
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Main Content Area (White Card) */}
      <View style={styles.contentCard}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo Section */}
          {/* <View style={styles.logoSection}>
            <Text style={styles.tagline}>Quality. Durability. Trust.</Text>
          </View> */}

          {/* User Info Card */}
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userProfile?.name || "Loading..."}</Text>
              <Text style={styles.userContact}>{userProfile?.email || ""}</Text>
              <Text style={styles.userContact}>{userProfile?.phone || ""}</Text>
            </View>
          </View>

          {/* Settings Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("AccountSettings")}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="settings-outline" size={20} color="#333" />
              </View>
              <Text style={styles.optionText}>Account Settings</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionRow} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Notifications")}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="notifications-outline" size={20} color="#333" />
              </View>
              <Text style={styles.optionText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionRow} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate("PrivacySecurity")}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#333" />
              </View>
              <Text style={styles.optionText}>Privacy & Security</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>


            <TouchableOpacity
              style={[styles.optionRow, isWarrantyExpanded && { borderBottomWidth: 0, paddingBottom: theme.spacing.sm }]}
              activeOpacity={0.7}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setIsWarrantyExpanded(!isWarrantyExpanded);
              }}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="document-outline" size={20} color="#333" />
              </View>
              <Text style={styles.optionText}>Terms & Conditions</Text>
              <Ionicons name={isWarrantyExpanded ? "chevron-down" : "chevron-forward"} size={16} color="#999" />
            </TouchableOpacity>

            {isWarrantyExpanded && (
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownOption}
                  activeOpacity={0.7}
                  onPress={() => Linking.openURL('https://wudgres.com/warranty')}
                >
                  <View style={styles.dropdownLeft}>
                    <Text style={styles.dropdownOptionText}>Warranty Information</Text>
                  </View>
                  {/* <Ionicons name="chevron-forward" size={14} color="#ccc" /> */}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dropdownOption, { borderBottomWidth: 0 }]}
                  activeOpacity={0.7}
                  onPress={() => Linking.openURL('https://wudgres.com/care-finishing')}
                >
                  <View style={styles.dropdownLeft}>
                    <Text style={styles.dropdownOptionText}>Care & Finishing Guide</Text>
                  </View>
                  {/* <Ionicons name="chevron-forward" size={14} color="#ccc" /> */}
                </TouchableOpacity>
              </View>
            )}


            <TouchableOpacity 
              style={styles.optionRow} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate("SupportContact")}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#333" />
              </View>
              <Text style={styles.optionText}>Support & Contact</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>



          {/* About Section */}
          {/* <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>About Wudgres</Text>
            <Text style={styles.aboutText}>
              Wudgres is a premium manufacturer of doors, frames, and plywood
              products. With a commitment to quality, durability, and trust, we
              provide the finest wood products for your home and commercial spaces.
            </Text>
          </View> */}

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Glass Menu Overlay */}
      <GlassMenu
        isVisible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(screen) => {
          setIsMenuOpen(false);
          if (screen === "Products") {
            navigation.navigate("ProductsStack", { screen: "AllProducts" });
          } else if (screen === "Home") {
            navigation.navigate("HomeStack", { screen: "Home" });
          } else if (screen === "Category") {
            navigation.navigate("HomeStack", { screen: "DoorsCategory" });
          } else {
            navigation.navigate(screen);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  headerBackground: {
    width: "100%",
  },
  headerContent: {
    paddingHorizontal: theme.spacing.xs,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  logoContainer: {
    height: 48,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginLeft: 0,
  },
  headerLogo: {
    height: 44,
    width: 85,
    alignSelf: "flex-start",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconButton: {
    marginTop: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Gilroy-Bold",
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginLeft: 0,
    paddingHorizontal: theme.spacing.md,
  },
  contentCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20, // Overlap the wood background
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100, // Extra padding for tab bar
  },
  logoSection: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  logo: {
    width: 140,
    height: 40,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    fontSize: theme.fontSize.sm,
    fontFamily: "Gilroy-Regular",
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(196, 169, 98, 0.15)", // Primary color with opacity
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSize.lg,
    fontFamily: "Gilroy-Bold",
    color: theme.colors.textDark,
    marginBottom: 2,
  },
  userContact: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    fontFamily: "Gilroy-Regular",
    marginBottom: 2,
  },
  optionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  optionText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontFamily: "Gilroy-Regular",
    color: theme.colors.textDark,
  },
  dropdownContainer: {
    backgroundColor: "#F4F4F4",
    borderRadius: 12,
    marginHorizontal: theme.spacing.xl, // indented further
    marginBottom: theme.spacing.md,
    marginTop: -theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownOptionText: {
    fontSize: theme.fontSize.sm,
    fontFamily: "Gilroy-Regular",
    color: theme.colors.textDark,
  },
  aboutSection: {
    backgroundColor: "#F9F9F9",
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  aboutTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: "Gilroy-Bold",
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.sm,
  },
  aboutText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    fontFamily: "Gilroy-Regular",
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244, 67, 54, 0.1)", // Error color with low opacity
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.3)",
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
    fontFamily: "Gilroy-Regular",
    marginLeft: theme.spacing.sm,
  },
});
