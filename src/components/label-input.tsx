import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/stores/themeStore";

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
  const { isDark } = useThemeStore();

  return (
    <View>
      <Text className="text-foreground font-medium mb-1.5">{label}</Text>
      <View className="relative">
        <TextInput
          className="w-full px-4 py-3 border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
          placeholder={placeholder}
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
          <Ionicons
            name={icon}
            size={20}
            color={isDark ? "hsl(217.9 10.6% 64.9%)" : "hsl(220 8.9% 46.1%)"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
