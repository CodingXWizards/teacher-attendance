import React, { useEffect } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

import { AuthService } from "@/services";
import { useUserStore } from "@/stores/userStore";
import { DatabaseProvider } from "@/components/DatabaseProvider";

// Import screens
import AppRouter from "./app/_router";

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <DatabaseProvider>
          <NavigationContainer>
            <AppRouter />
          </NavigationContainer>
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});

export default App;
