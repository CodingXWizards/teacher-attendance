import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LabelInputProps {
  label: string;
  value: string;
  type?: "text" | "password";
  placeholder?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onChangeText: (text: string) => void;
  onIconPress?: () => void;
}

export const LabelInput = ({
  label,
  value,
  type = "text",
  placeholder = "Enter your email",
  icon,
  onChangeText,
  onIconPress,
}: LabelInputProps) => {
  return (
    <View>
      <Text className="text-gray-700 font-medium mb-1.5">{label}</Text>
      <View className="relative">
        <TextInput
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={type === "password"}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          className="absolute right-3 top-2.5"
          onPress={onIconPress}
        >
          <Ionicons name={icon} size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
