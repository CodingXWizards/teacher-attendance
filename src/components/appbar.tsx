import React from "react";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
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
  const navigation = useNavigation();
  
  return (
    <View className="flex-row items-center gap-4 border-b border-border px-4 py-2">
      {showBack && (
        <TouchableOpacity
          className="size-10 rounded-full bg-card border border-border justify-center items-center"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} className="text-foreground" />
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
