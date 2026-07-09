import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ImageBackground,
  Switch
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme";
import { backgroundImages } from "../data/mockData";

interface NotificationsScreenProps {
  navigation: any;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

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
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Main Content Area (White Card) */}
      <View style={styles.contentCard}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          
          {/* General Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive alerts on your device.</Text>
              </View>
              <Switch
                trackColor={{ false: "#D1D1D6", true: theme.colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D1D1D6"
                onValueChange={setPushEnabled}
                value={pushEnabled}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Receive updates via email.</Text>
              </View>
              <Switch
                trackColor={{ false: "#D1D1D6", true: theme.colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D1D1D6"
                onValueChange={setEmailEnabled}
                value={emailEnabled}
              />
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Order Updates</Text>
                <Text style={styles.settingDescription}>Get notified about your purchase status and delivery.</Text>
              </View>
              <Switch
                trackColor={{ false: "#D1D1D6", true: theme.colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D1D1D6"
                onValueChange={setOrderUpdates}
                value={orderUpdates}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Promotions & Offers</Text>
                <Text style={styles.settingDescription}>Hear about new products, exclusive sales, and discounts.</Text>
              </View>
              <Switch
                trackColor={{ false: "#D1D1D6", true: theme.colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D1D1D6"
                onValueChange={setPromotions}
                value={promotions}
              />
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.textMuted} />
            <Text style={styles.infoText}>
              Note: You can always change these preferences later. System alerts and security notifications cannot be disabled.
            </Text>
          </View>
          
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBackground: {
    width: "100%",
    paddingBottom: 40, 
  },
  headerContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Unbounded_700Bold",
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
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
    paddingBottom: 100, // Extra padding for bottom
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Unbounded_600SemiBold',
    color: theme.colors.primaryDark,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: 'Unbounded_500Medium',
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    fontFamily: 'Unbounded_400Regular',
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(196, 169, 98, 0.05)',
    padding: 16,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(196, 169, 98, 0.2)',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: theme.fontSize.sm,
    fontFamily: 'Unbounded_400Regular',
    color: theme.colors.textMuted,
    lineHeight: 20,
  }
});
