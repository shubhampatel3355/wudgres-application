import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Image,
  ScrollView,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import * as SecureStore from "expo-secure-store";

interface RegisterScreenProps {
  navigation: any;
  route?: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation, route }) => {
  const { initialPhone } = route?.params || {};

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(initialPhone || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (text: string) => {
    // Strip +91 if pasted
    let cleaned = text.replace(/^\+91/, '');
    // Remove all non-numeric characters
    cleaned = cleaned.replace(/[^0-9]/g, '');
    // Limit to 10 digits
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }
    setPhone(cleaned);
  };

  const handleSendOtp = async () => {
    if (loading) return; // Prevent double clicks
    if (!name.trim() || !email.trim() || !phone || phone.length !== 10) {
      Alert.alert("Error", "Please fill in all fields (Name, Email, and a valid 10-digit Phone No.)");
      return;
    }

    setLoading(true);
    const formattedPhone = `+91${phone}`;

    // Trigger OTP sending via Supabase Auth
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (loading) return; // Prevent double clicks
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP");
      return;
    }

    setLoading(true);
    const formattedPhone = `+91${phone}`;

    // Step 1: Verify OTP (This securely logs them in / creates their auth user)
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
    });

    if (error) {
      setLoading(false);
      Alert.alert("Verification Failed", error.message);
      return;
    }

    // Step 2: Now that they are authenticated, save their name/email to profiles
    if (data?.user?.id) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          name: name,
          email: email,
          phone: formattedPhone,
          is_admin: false,
        });

      if (profileError) {
        console.warn("Profile upsert warning:", profileError.message);
      }
    }

    await SecureStore.setItemAsync('session_start_time', Date.now().toString());

    setLoading(false);
    Alert.alert("Success", "Account created successfully!");
    navigation.replace("Loader");
  };

  return (
    <ImageBackground
      source={require("../assets/images/backgrounds/wood-texture.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image 
              source={require("../assets/images/footer_logo.png")} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Create an account to continue</Text>
          </View>

          {/* Register Card */}
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Sign Up</Text>

            {!otpSent ? (
              <>
                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#9ca3af"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Phone Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Phone No."
                    placeholderTextColor="#9ca3af"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    keyboardType="numeric"
                    maxLength={13}
                  />
                </View>

                {/* Send OTP Button */}
                <TouchableOpacity
                  style={[styles.loginButton, loading && { opacity: 0.7 }]}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* OTP Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#9ca3af"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                {/* Verify & Create Account Button */}
                <TouchableOpacity
                  style={[styles.loginButton, loading && { opacity: 0.7 }]}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Verify & Create Account</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Login Section */}
            <View style={styles.registerSection}>
              <Text style={styles.newUserText}>Already have an account?</Text>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => {
                  Keyboard.dismiss();
                  setTimeout(() => {
                    navigation.navigate("Login");
                  }, 150);
                }}
              >
                <Text style={styles.registerButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoImage: {
    width: 250,
    height: 60,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Gilroy-Regular",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: "Gilroy-Bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#000000",
    fontSize: 15,
    fontFamily: "Gilroy-Regular",
  },
  eyeIcon: {
    padding: 5,
  },
  loginButton: {
    backgroundColor: "#000000",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Gilroy-Regular",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 25,
  },
  registerSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  newUserText: {
    color: "#000000",
    fontSize: 14,
    fontFamily: "Gilroy-Regular",
    marginRight: 15,
  },
  registerButton: {
    backgroundColor: "#000000",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  registerButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Gilroy-Regular",
  },
});
