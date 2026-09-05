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
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import * as SecureStore from "expo-secure-store";

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [phone, setPhone] = useState("");
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
    if (!phone || phone.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      // Check if user exists (check both 10-digit and +91 formats in DB just in case)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, phone")
        .or(`phone.eq.${phone},phone.eq.+91${phone}`)
        .limit(1)
        .maybeSingle();

      if (!profileData) {
        Keyboard.dismiss();
        setLoading(false);
        // Delay slightly to let keyboard close and prevent violent layout shift
        setTimeout(() => {
          navigation.navigate("Register", { initialPhone: phone });
        }, 150);
        return;
      }

      // Supabase Auth requires E.164 format for SMS
      const formattedPhone = `+91${phone}`;

      // User exists, send OTP
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setOtpSent(true);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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

    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
    });

    setLoading(false);

    if (error) {
      Alert.alert("Login Failed", error.message);
    } else {
      await SecureStore.setItemAsync('session_start_time', Date.now().toString());
      navigation.replace("Loader");
    }
  };

  const handleRegister = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      navigation.navigate("Register");
    }, 150);
  };

  return (
    <ImageBackground
      source={require("../assets/images/backgrounds/wood-texture.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Optional: Slight dark overlay to make white text pop more */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image 
            source={require("../assets/images/footer_logo.png")} 
            style={styles.logoImage} 
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Quality. Durability. Trust.</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Welcome Back</Text>

          {!otpSent ? (
            <>
              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#9ca3af"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="numeric"
                  maxLength={13} // Allow space for pasted +91... before it gets stripped
                  autoCapitalize="none"
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

              {/* Verify OTP Button */}
              <TouchableOpacity 
                style={[styles.loginButton, loading && { opacity: 0.7 }]} 
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Verify & Login</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.forgotPassword} onPress={() => setOtpSent(false)}>
                <Text style={styles.forgotPasswordText}>Change Phone Number</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Register Section */}
          <View style={styles.registerSection}>
            <Text style={styles.newUserText}>New User?</Text>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Darkens the wood texture slightly
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
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
    backgroundColor: "#F3F4F6", // Light gray like the image
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#4b5563",
    fontSize: 12,
    fontFamily: "Gilroy-Regular",
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#000000",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 25,
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
