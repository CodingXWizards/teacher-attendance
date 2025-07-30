import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LucideIcon, Eye, EyeOff } from "lucide-react-native";
import { useThemeStore } from "@/stores/themeStore";

interface LabelInputProps {
  label: string;
  value: string;
  type?: "text" | "password";
  placeholder?: string;
  icon: LucideIcon;
  onChangeText: (text: string) => void;
  onIconPress?: () => void;
}

export const LabelInput = ({
  label,
  value,
  type = "text",
  placeholder = "Enter your email",
  icon: Icon,
  onChangeText,
  onIconPress,
}: LabelInputProps) => {
  const { isDark } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);

  const handleIconPress = () => {
    if (type === "password") {
      setShowPassword(!showPassword);
    } else if (onIconPress) {
      onIconPress();
    }
  };

  const getIconColor = () => {
    return isDark ? "hsl(217.9 10.6% 64.9%)" : "hsl(220 8.9% 46.1%)";
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={type === "password" && !showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.iconButton} onPress={handleIconPress}>
          {type === "password" ? (
            showPassword ? (
              <EyeOff size={20} color={getIconColor()} />
            ) : (
              <Eye size={20} color={getIconColor()} />
            )
          ) : (
            <Icon size={20} color={getIconColor()} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    color: "#1f2937",
    fontWeight: "500",
    marginBottom: 6,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    color: "#1f2937",
    fontSize: 16,
  },
  iconButton: {
    position: "absolute",
    right: 12,
    top: 10,
  },
});
