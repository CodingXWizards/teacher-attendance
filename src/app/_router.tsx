import React, { useEffect } from "react";
import { router, Stack } from "expo-router";

import { AuthService } from "@/services";
import { useUserStore } from "@/stores/userStore";

const AppRouter = () => {
  const { setUser } = useUserStore();

  useEffect(() => {
    AuthService.isAuthenticated().then(async (isAuthenticated) => {
      if (!isAuthenticated) {
        router.replace("/login");
      } else {
        try {
          const user = await AuthService.getCurrentUser();
          setUser(user);
          router.replace("/");
        } catch (error) {
          console.error("Error getting current user:", error);
          router.replace("/login");
        }
      }
    });
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Dashboard",
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
      <Stack.Screen
        name="class/[id]"
        options={{
          title: "Class Details",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="class/student/[studentId]"
        options={{
          title: "Student Details",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="attendance/[id]"
        options={{
          title: "Take Attendance",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default AppRouter;
