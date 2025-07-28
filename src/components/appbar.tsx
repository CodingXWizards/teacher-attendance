import React from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface AppbarProps {
  title: string;
  showBack?: boolean;
  subtitle?: string;
  trailing?: React.ReactNode;
}

export const Appbar = ({
  title,
  subtitle,
  trailing,
  showBack = true,
}: AppbarProps) => {
  return (
    <View className="flex-row items-center gap-4 border-b border-border px-4 py-2">
      {showBack && (
        <TouchableOpacity
          className="size-10 rounded-full bg-card border border-border justify-center items-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} className="text-foreground" />
        </TouchableOpacity>
      )}
      <View className="flex-1">
        <Text className="text-xl font-bold text-foreground mb-1">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-muted-foreground">{subtitle}</Text>
        )}
      </View>
      {trailing}
    </View>
  );
};
