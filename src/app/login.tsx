import {
  View,
  Text,
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { AuthService } from "@/services";
import { Eye, EyeOff, Mail, Lock, School } from "lucide-react-native";
import { useUserStore } from "@/stores/userStore";
import { LabelInput } from "@/components/label-input";

const LoginScreen = () => {
  const { setUser } = useUserStore();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthService.login({ email, password });

      // Store user data in global state
      setUser(response.user);

      // Navigate to home screen
      navigation.navigate("Dashboard" as never);
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        error instanceof Error
          ? error.message
          : "Invalid credentials. Please try again.",
      );
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
      className="flex-1 bg-black"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20 pb-8 flex flex-col justify-center">
          <View>
            {/* Header */}
            <View className="items-center mb-12">
              <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
                <School size={40} color="white" />
              </View>
              <Text className="text-3xl font-bold text-foreground mb-2">
                Welcome Back
              </Text>
              <Text className="text-muted-foreground text-center">
                Sign in to your account to continue
              </Text>
            </View>

            {/* Login Form */}
            <View className="flex flex-col gap-y-3">
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
                type={showPassword ? "text" : "password"}
                onChangeText={setPassword}
                onIconPress={() => setShowPassword(!showPassword)}
                icon={showPassword ? EyeOff : Eye}
                placeholder="Enter your password"
              />

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                className="self-end"
              >
                <Text className="text-primary font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className={`w-full py-3 mt-4 rounded-lg ${
                  isLoading ? "bg-muted" : "bg-primary"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-primary-foreground text-center font-semibold text-lg">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-3">
                <View className="flex-1 h-px bg-border" />
                <Text className="mx-4 text-muted-foreground">or</Text>
                <View className="flex-1 h-px bg-border" />
              </View>

              {/* Register Link */}
              <View className="flex-row justify-center">
                <Text className="text-muted-foreground">
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text className="text-primary font-medium">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
