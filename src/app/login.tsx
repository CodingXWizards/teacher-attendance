import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { School, Mail, Lock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

import { AuthService } from "@/services";
import { useUserStore } from "@/stores/userStore";
import { LabelInput } from "@/components/label-input";

const LoginScreen = () => {
  const { setUser } = useUserStore();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthService.login({ email, password });
      setUser(response.user);
      // Navigate to data sync screen instead of directly to dashboard
      navigation.navigate("DataSync", { user: response.user } as never);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    Alert.alert(
      "Not Implemented",
      "Forgot password feature is not implemented yet.",
    );
  };

  const handleRegister = () => {
    // TODO: Implement register
    Alert.alert("Not Implemented", "Register feature is not implemented yet.");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <School size={40} color="white" />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to your account to continue
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              <LabelInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                icon={Mail}
                placeholder="Enter your email"
              />
              <LabelInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                type="password"
                icon={Lock}
                placeholder="Enter your password"
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text style={styles.registerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
    flexDirection: "column",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#8b5cf6",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6b7280",
    textAlign: "center",
  },
  form: {
    flexDirection: "column",
    gap: 12,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#8b5cf6",
    fontWeight: "500",
  },
  loginButton: {
    width: "100%",
    paddingVertical: 12,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  loginButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#6b7280",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    color: "#6b7280",
  },
  registerLink: {
    color: "#8b5cf6",
    fontWeight: "500",
  },
});

export default LoginScreen;
