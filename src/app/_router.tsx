import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import LoginScreen from "@/app/login";
import { AuthService } from "@/services";
import DashboardScreen from "@/app/index";
import ProfileScreen from "@/app/profile";
import DataSyncScreen from "@/app/data-sync";
import AttendanceScreen from "@/app/attendance";
import ClassDetailsScreen from "@/app/class/[id]";
import { useUserStore } from "@/stores/userStore";
import TakeAttendanceScreen from "@/app/attendance/[id]";
import { createStackNavigator } from "@react-navigation/stack";
import StudentDetailsScreen from "@/app/class/student/[studentId]";
import ReportsScreen from "@/app/reports";

const Stack = createStackNavigator();

const AppRouter = () => {
  const { setUser } = useUserStore();
  const navigation = useNavigation();

  useEffect(() => {
    AuthService.isAuthenticated().then(async isAuthenticated => {
      if (isAuthenticated) {
        try {
          const user = await AuthService.getCurrentUser();
          setUser(user);
          // For now, always go to dashboard if authenticated
          // Data sync will be handled during login flow
          navigation.navigate("Dashboard" as never);
        } catch (error) {
          console.error("Error getting current user:", error);
          navigation.navigate("Login" as never);
        }
      } else {
        navigation.navigate("Login" as never);
      }
    });
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="DataSync" component={DataSyncScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="ClassDetails"
        component={ClassDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudentDetails"
        component={StudentDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TakeAttendance"
        component={TakeAttendanceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppRouter;
