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
import { router } from "expo-router";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { AuthService } from "@/services";
import { LabelInput } from "@/components/label-input";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.login({ email, password });

      Alert.alert("Success", "Login successful!", [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]);
    } catch (error) {
      console.log("Login error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20 pb-8 flex flex-col justify-center">
          <View>
            {/* Header */}
            <View className="items-center mb-12">
              <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
                <Ionicons name="school" size={40} color="white" />
              </View>
              <Text className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back
              </Text>
              <Text className="text-gray-600 text-center">
                Sign in to your account to continue
              </Text>
            </View>

            {/* Login Form */}
            <View className="flex flex-col gap-y-3">
              <LabelInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                icon="mail"
                placeholder="Enter your email"
              />
              <LabelInput
                label="Password"
                value={password}
                type={showPassword ? "text" : "password"}
                onChangeText={setPassword}
                onIconPress={() => setShowPassword(!showPassword)}
                icon={showPassword ? "eye-off" : "eye"}
                placeholder="Enter your password"
              />

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                className="self-end"
              >
                <Text className="text-blue-500 font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className={`w-full py-2 mt-4 rounded-lg ${
                  isLoading ? "bg-gray-400" : "bg-blue-500"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-3">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-500">or</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              {/* Register Link */}
              <View className="flex-row justify-center">
                <Text className="text-gray-600">Don't have an account? </Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text className="text-blue-500 font-medium">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View className="mt-auto pt-5">
              <Text className="text-gray-500 text-center text-sm">
                By signing in, you agree to our Terms of Service and Privacy
                Policy
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
