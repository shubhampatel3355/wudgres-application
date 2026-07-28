import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ImageBackground,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme";
import { supabase } from "../lib/supabase";
import { backgroundImages } from "../data/mockData";

interface PrivacySecurityScreenProps {
  navigation: any;
}

export const PrivacySecurityScreen: React.FC<PrivacySecurityScreenProps> = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    setIsUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Could not identify current user email.");

      // 1. Verify current password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error("The current password you entered is incorrect.");
      }

      // 2. Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      Alert.alert("Success", "Your password has been updated successfully.", [
        { 
          text: "OK", 
          onPress: () => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          } 
        }
      ]);
    } catch (error: any) {
      console.error("Error updating password:", error);
      Alert.alert("Error", error.message || "Failed to update password. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            Alert.alert("Request Received", "For security reasons, please contact support to complete your account deletion request.");
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
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>Privacy & Security</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Main Content Area (White Card) */}
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.contentCard}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            {/* Update Password Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Change Password</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]} 
                onPress={handleUpdatePassword}
                disabled={isUpdating}
                activeOpacity={0.8}
              >
                {isUpdating ? (
                  <ActivityIndicator color={theme.colors.textPrimary} />
                ) : (
                  <Text style={styles.saveButtonText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Data Privacy Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Privacy</Text>
              <Text style={styles.infoText}>
                We take your privacy seriously. Your data is securely encrypted and stored following industry standards. We do not sell your personal information to third parties.
              </Text>
              
              <TouchableOpacity style={styles.linkButton} activeOpacity={0.7}>
                <Text style={styles.linkText}>Read our Privacy Policy</Text>
                <Ionicons name="open-outline" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Danger Zone */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#E53935' }]}>Danger Zone</Text>
              <Text style={styles.infoText}>
                Permanently delete your account and all associated data. This action is irreversible.
              </Text>
              
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={handleDeleteAccount}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={20} color="#E53935" style={{ marginRight: 8 }} />
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
            
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    fontFamily: "Gilroy-Bold",
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  keyboardView: {
    flex: 1,
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
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Gilroy-Bold',
    color: theme.colors.textDark,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontFamily: 'Gilroy-Regular',
    color: theme.colors.textDark,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: theme.fontSize.md,
    fontFamily: 'Gilroy-Regular',
    color: theme.colors.textDark,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#C4A962',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontFamily: 'Gilroy-Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 24,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    fontFamily: 'Gilroy-Regular',
    color: theme.colors.textMuted,
    lineHeight: 22,
    marginBottom: 16,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: theme.fontSize.sm,
    fontFamily: 'Gilroy-Regular',
    color: theme.colors.primary,
    marginRight: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(229, 57, 53, 0.1)', // Very light red
    borderWidth: 1,
    borderColor: 'rgba(229, 57, 53, 0.3)',
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#E53935',
    fontSize: theme.fontSize.md,
    fontFamily: 'Gilroy-Regular',
  }
});
