import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import StudentDetailsScreen from "@/app/class/student/[studentId]";
import React, { useEffect } from "react";

import LoginScreen from "@/app/login";
import { AuthService } from "@/services";
import DashboardScreen from "@/app/index";
import ProfileScreen from "@/app/profile";
import ReportsScreen from "@/app/reports";
import MarksScreen from "@/app/marks";
import AddEditMarksScreen from "@/app/marks/add-edit";
import { useNavigation } from "@/navigation";
import DataSyncScreen from "@/app/data-sync";
import SyncLogsScreen from "@/app/sync-logs";
import SplashScreen from "@/app/splash-screen";
import AttendanceScreen from "@/app/attendance";
import { useUserStore } from "@/stores/userStore";
import ClassDetailsScreen from "@/app/class/[classId]";
import { useDatabase } from "@/components/DatabaseProvider";
import TakeAttendanceScreen from "@/app/attendance/[classId]";

const Stack = createStackNavigator();

const AppRouter = () => {
  const { setUser } = useUserStore();
  const navigation = useNavigation();
  const { isLoading: isDatabaseLoading } = useDatabase();

  useEffect(() => {
    if (isDatabaseLoading) {
      return;
    }

    AuthService.isAuthenticated().then(async isAuthenticated => {
      if (isAuthenticated) {
        try {
          const user = await AuthService.getCurrentUserFromStore();
          navigation.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
          });
          setUser(user);
        } catch (error) {
          console.error("Error getting current user:", error);
        }
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    });
  }, [isDatabaseLoading]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
      initialRouteName="Splash"
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
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
      <Stack.Screen
        name="SyncLogs"
        component={SyncLogsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Marks"
        component={MarksScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddEditMarks"
        component={AddEditMarksScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppRouter;
