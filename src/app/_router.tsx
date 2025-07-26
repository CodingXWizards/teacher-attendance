import React, { useEffect } from "react";
import { router, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";

const AppRouter = () => {
  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        router.replace("/login");
      }
    };
    checkToken();
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Teacher Attendance",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="attendance"
        options={{
          title: "Take Attendance",
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: "Attendance History",
        }}
      />
      <Stack.Screen
        name="teachers"
        options={{
          title: "Manage Teachers",
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          title: "Reports",
        }}
      />
    </Stack>
  );
};

export default AppRouter;
