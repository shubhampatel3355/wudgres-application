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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatPhone = (p: string) => {
    return p.startsWith("+") ? p : `+91${p}`;
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    // Step 1: Create the auth account
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
          phone: formatPhone(phone),
        },
      },
    });

    if (error) {
      setLoading(false);
      Alert.alert("Registration Failed", error.message);
      return;
    }

    // Step 2: Directly upsert the profile with all fields
    if (data?.user?.id) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          name: name,
          email: email,
          phone: formatPhone(phone),
          password: password,
          is_admin: false,
        });

      if (profileError) {
        console.warn("Profile upsert warning:", profileError.message);
      }
    }

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
                onChangeText={setPhone}
                keyboardType="phone-pad"
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

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Login Section */}
            <View style={styles.registerSection}>
              <Text style={styles.newUserText}>Already have an account?</Text>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => navigation.navigate("Login")}
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
    fontFamily: "Unbounded_400Regular",
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
