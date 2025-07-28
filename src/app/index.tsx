import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useUserStore } from "@/stores/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsConnected } from 'react-native-offline'; // Add this import

import { Appbar } from "@/components/appbar";
import { ClassWithDetails, DashboardStats, TeacherClass } from "@/types";
import { DashboardService, ClassesService, TeachersService } from "@/services";
import NetworkStatus from "@/components/NetworkStatus"; // You'll create this component
import AttendanceService from "@/services/attendance"; // You'll create this

export default function Home() {
  const { user } = useUserStore();
  const isConnected = useIsConnected(); // Add network status
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [assignments, setAssignments] = useState<TeacherClass[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    todaySessions: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setError(null);

      if (user?.role === "teacher") {
        // For teachers, first get their teacher profile to get the teacher ID
        const teacherProfile = await TeachersService.getTeacherProfile();
        const teacherDashboard = await DashboardService.getTeacherDashboard(
          teacherProfile.id
        );
        setClasses(teacherDashboard.classes);
        setAssignments(teacherDashboard.assignments);
        setStats(teacherDashboard.stats);
      } else {
        // For admins/principals, get all classes and general stats
        const [allClasses, dashboardStats] = await Promise.all([
          ClassesService.getActiveClasses(),
          DashboardService.getDashboardStats(),
        ]);

        const classesWithDetails: ClassWithDetails[] = [];

        for (const classData of allClasses) {
          try {
            const details = await ClassesService.getClassWithDetails(
              classData.id
            );
            classesWithDetails.push(details);
          } catch (error) {
            console.warn(
              `Failed to get details for class ${classData.id}:`,
              error
            );
          }
        }

        setClasses(classesWithDetails);
        setStats(dashboardStats);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    // Try to sync when refreshing
    if (isConnected) {
      await AttendanceService.syncPendingOperations();
    }
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (!user) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-5">
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-foreground text-lg font-semibold mt-4 mb-2">
          Something went wrong
        </Text>
        <Text className="text-muted-foreground text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="px-6 py-3 bg-primary rounded-lg"
          onPress={loadDashboardData}
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const generateColorFromString = (str: string): string => {
    const colors = [
      "#8b5cf6", // Purple
      "#06b6d4", // Cyan
      "#10b981", // Emerald
      "#f59e0b", // Amber
      "#ef4444", // Red
      "#3b82f6", // Blue
      "#84cc16", // Lime
      "#f97316", // Orange
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        <Appbar
          showBack={false}
          title={`Good morning, ${user.firstName}!`}
          subtitle={
            user.role === "teacher"
              ? "Here are your assigned classes for today"
              : "Here's an overview of your school today"
          }
          trailing={
            <TouchableOpacity onPress={() => router.push("/profile")}>
              <Ionicons name="person" size={24} className="text-foreground" />
            </TouchableOpacity>
          }
        />
        
        {/* Add Network Status Component */}
        <NetworkStatus />
        
        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Rest of your existing component remains the same */}
          {/* Stats Cards */}
          <View className="flex flex-row gap-3 mb-8">
            {user.role === "teacher" ? (
              // Teacher-specific stats
              <>
                <View className="flex-1 p-4 rounded-xl bg-card border border-border items-center">
                  <Ionicons name="school" size={24} color="#8b5cf6" />
                  <Text className="text-2xl font-bold text-foreground mt-2 mb-1">
                    {stats.totalClasses}
                  </Text>
                  <Text className="text-xs text-muted-foreground text-center">
                    My Classes
                  </Text>
                </View>
                <View className="flex-1 p-4 rounded-xl bg-card border border-border items-center">
                  <Ionicons name="book" size={24} color="#06b6d4" />
                  <Text className="text-2xl font-bold text-foreground mt-2 mb-1">
                    {stats.totalSubjects}
                  </Text>
                  <Text className="text-xs text-muted-foreground text-center">
                    My Subjects
                  </Text>
                </View>
                <View className="flex-1 p-4 rounded-xl bg-card border border-border items-center">
                  <Ionicons name="calendar" size={24} color="#10b981" />
                  <Text className="text-2xl font-bold text-foreground mt-2 mb-1">
                    {stats.todaySessions}
                  </Text>
                  <Text className="text-xs text-muted-foreground text-center">
                    Today's Classes
                  </Text>
                </View>
              </>
            ) : (
              // Admin/Principal stats
              <>
                <View className="flex-1 p-4 rounded-xl bg-card border border-border items-center">
                  <Ionicons name="school" size={24} color="#8b5cf6" />
                  <Text className="text-2xl font-bold text-foreground mt-2 mb-1">
                    {stats.totalClasses}
                  </Text>
                  <Text className="text-xs text-muted-foreground text-center">
                    Total Classes
                  </Text>
                </View>
                <View className="flex-1 p-4 rounded-xl bg-card border border-border items-center">
                  <Ionicons name="people" size={24} color="#06b6d4" />
                  <Text className="text-2xl font-bold text-foreground mt-2 mb-1">
                    {stats.totalStudents}
                  </Text>
                  <Text className="text-xs text-muted-foreground text-center">
                    Total Students
                  </Text>
                </View>
                <View className="flex-1 p-4 rounded-xl bg-card border border-border items-center">
                  <Ionicons name="calendar" size={24} color="#10b981" />
                  <Text className="text-2xl font-bold text-foreground mt-2 mb-1">
                    {stats.todaySessions}
                  </Text>
                  <Text className="text-xs text-muted-foreground text-center">
                    Today's Sessions
                  </Text>
                </View>
              </>
            )}
          </View>
          
          {/* Rest of your existing JSX remains unchanged */}
          {/* Classes Section, Quick Actions, etc. */}
          
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
