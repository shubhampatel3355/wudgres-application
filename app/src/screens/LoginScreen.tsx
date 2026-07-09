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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    // Check if the user already has a valid JWT session saved
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigation.replace("Main");
      }
    };
    checkUser();
  }, []);

  // Helper to format phone (assuming India +91 if no country code provided)
  const formatPhone = (p: string) => {
    return p.startsWith('+') ? p : `+91${p}`;
  };

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert("Error", "Please enter your Email/Phone and Password");
      return;
    }
    
    setLoading(true);
    
    const isEmail = emailOrPhone.includes('@');
    let loginEmail = emailOrPhone;

    // If user entered a phone number, look up their email from profiles
    if (!isEmail) {
      const formattedPhone = formatPhone(emailOrPhone);
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", formattedPhone)
        .single();

      if (profileError || !profileData) {
        setLoading(false);
        Alert.alert("Login Failed", "No account found with this phone number. Please use your email or register first.");
        return;
      }

      // Get the email from auth admin - fetch by querying auth users via RPC or use email from profile
      // Since we can't access auth.users directly, prompt user to use email
      setLoading(false);
      Alert.alert(
        "Use Email to Login",
        "Phone login is not enabled. Please login with your email address instead.",
      );
      return;
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Login Failed", error.message);
    } else {
      navigation.replace("Loader");
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
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

          {/* Email/Phone Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email or Phone Number"
              placeholderTextColor="#9ca3af"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#4b5563"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>forgot password</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Let's Go</Text>
            )}
          </TouchableOpacity>

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
    fontFamily: "Unbounded_400Regular",
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
    fontFamily: "Unbounded_600SemiBold",
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
    fontFamily: "Unbounded_400Regular",
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
    fontFamily: "Unbounded_600SemiBold",
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
    fontFamily: "Unbounded_500Medium",
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
    fontFamily: "Unbounded_500Medium",
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
    fontFamily: "Unbounded_500Medium",
  },
});
