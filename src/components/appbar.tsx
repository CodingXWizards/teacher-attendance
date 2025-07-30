import React from "react";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

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
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#8b5cf6" />
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {trailing}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
});
