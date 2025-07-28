import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import "./app/global.css";

import { AuthService } from "@/services";
import { useUserStore } from "@/stores/userStore";
import { DatabaseProvider } from "@/components/DatabaseProvider";

// Import screens
import DashboardScreen from "./app/index";
import LoginScreen from "./app/login";
import AttendanceScreen from "./app/attendance";
import HistoryScreen from "./app/history";
import TeachersScreen from "./app/teachers";
import ReportsScreen from "./app/reports";
import ProfileScreen from "./app/profile";
import ClassDetailsScreen from "./app/class/[id]";
import StudentDetailsScreen from "./app/class/student/[studentId]";
import TakeAttendanceScreen from "./app/attendance/[id]";

const Stack = createStackNavigator();

const App = () => {
  const { setUser } = useUserStore();

  useEffect(() => {
    AuthService.isAuthenticated().then(async isAuthenticated => {
      if (!isAuthenticated) {
        // Handle unauthenticated state
        console.log("User not authenticated");
      } else {
        try {
          const user = await AuthService.getCurrentUser();
          setUser(user);
        } catch (error) {
          console.error("Error getting current user:", error);
        }
      }
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DatabaseProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen
                name="Attendance"
                component={AttendanceScreen}
                options={{ headerShown: true, title: "Take Attendance" }}
              />
              <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{ headerShown: true, title: "Attendance History" }}
              />
              <Stack.Screen
                name="Teachers"
                component={TeachersScreen}
                options={{ headerShown: true, title: "Manage Teachers" }}
              />
              <Stack.Screen
                name="Reports"
                component={ReportsScreen}
                options={{ headerShown: true, title: "Reports" }}
              />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen
                name="ClassDetails"
                component={ClassDetailsScreen}
                options={{ headerShown: true, title: "Class Details" }}
              />
              <Stack.Screen
                name="StudentDetails"
                component={StudentDetailsScreen}
                options={{ headerShown: true, title: "Student Details" }}
              />
              <Stack.Screen
                name="TakeAttendance"
                component={TakeAttendanceScreen}
                options={{ headerShown: true, title: "Take Attendance" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
