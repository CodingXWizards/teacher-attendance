import React from "react";
import { ActivityIndicator, View } from "react-native";

export const ScreenLoader = () => {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="hsl(262.1 83.3% 57.8%)" />
    </View>
  );
};
