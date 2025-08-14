import {
  View,
  Text,
  Modal,
  Animated,
  StatusBar,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { useTheme, Colors } from "@/contexts/ThemeContext";

const { width } = Dimensions.get("window");

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.backdrop,
    },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    alertContainer: {
      paddingTop: 20,
      backgroundColor: colors.surface,
      borderRadius: 14,
      width: width - 40,
      maxWidth: width - 80,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 20,
      },
      shadowOpacity: 0.3,
      shadowRadius: 25,
      elevation: 15,
      overflow: "hidden",
    },
    title: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
      paddingHorizontal: 20,
    },
    message: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 18,
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    buttonContainer: {
      borderTopWidth: 0.5,
      borderColor: colors.divider,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },
    button: {
      flex: 1,
      borderLeftWidth: 0.5,
      borderColor: colors.divider,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      borderBottomColor: colors.divider,
    },
    singleButton: {
      borderBottomWidth: 0,
    },
    destructiveButton: {
      // iOS destructive button styling
    },
    cancelButton: {
      // iOS cancel button styling
    },
    buttonText: {
      fontSize: 17,
      fontWeight: "400",
      color: colors.primary,
    },
    destructiveButtonText: {
      color: colors.error,
    },
    cancelButtonText: {
      color: colors.error,
    },
  });

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface AlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: "success" | "error" | "info" | "warning";
  onDismiss?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  buttons = [],
  type = "info",
  onDismiss,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleBackdropPress = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      {/* <StatusBar
        backgroundColor={colors.backdrop}
        barStyle={isDark ? "light-content" : "dark-content"}
      /> */}

      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: opacityAnim,
            },
          ]}
        />
      </TouchableOpacity>
      {/* Alert Container */}
      <View style={styles.container}>
        <View style={[styles.alertContainer]}>
          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          {buttons.length > 0 && (
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    index === 0 && { borderLeftWidth: 0 },
                    button.style === "destructive" && styles.destructiveButton,
                    button.text === "Cancel" && styles.cancelButton,
                    buttons.length === 1 && styles.singleButton,
                  ]}
                  onPress={() => handleButtonPress(button)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      button.style === "destructive" &&
                        styles.destructiveButtonText,
                      button.text === "Cancel" && styles.cancelButtonText,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Default OK button if no buttons provided */}
          {buttons.length === 0 && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.singleButton,
                  { borderLeftWidth: 0 },
                ]}
                onPress={onDismiss}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default Alert;
