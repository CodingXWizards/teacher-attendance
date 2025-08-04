import React from "react";
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { GraduationCap } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

const { width, height } = Dimensions.get("window");

const SplashScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Subtle background pattern */}
      <View style={styles.backgroundPattern}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
        <View style={styles.patternCircle3} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo section */}
        <View style={styles.logoSection}>
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: colors.primaryContainer },
            ]}
          >
            <GraduationCap
              size={48}
              color={colors.onPrimary}
              strokeWidth={1.5}
            />
          </View>
        </View>

        {/* Title section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.onPrimary }]}>
            Teacher Attendance
          </Text>
        </View>

        {/* Subtitle section */}
        <View style={styles.subtitleSection}>
          <Text style={[styles.subtitle, { color: colors.onPrimary }]}>
            Professional attendance management system
          </Text>
        </View>
      </View>

      {/* Progress indicator */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.onPrimary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: "absolute",
    top: height * 0.1,
    right: -width * 0.2,
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  patternCircle2: {
    position: "absolute",
    bottom: height * 0.2,
    left: -width * 0.15,
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  patternCircle3: {
    position: "absolute",
    top: height * 0.6,
    right: width * 0.1,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    flex: 1,
  },
  logoSection: {
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitleSection: {
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "400",
    lineHeight: 22,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 120,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 40,
  },
  progressBar: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 2,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
