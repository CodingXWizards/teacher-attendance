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

import { Appbar } from "@/components/appbar";
import { ClassWithDetails, DashboardStats, TeacherClass } from "@/types";
import { DashboardService, ClassesService, TeachersService } from "@/services";

export default function Home() {
  const { user } = useUserStore();
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
        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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
          {/* Classes Section */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-foreground">
                {user.role === "teacher" ? "Your Assignments" : "All Classes"}
              </Text>
              {(user.role === "admin" || user.role === "principal") && (
                <TouchableOpacity
                  className="w-10 h-10 rounded-full bg-card border border-border justify-center items-center"
                  onPress={() => router.push("/add-class")}
                >
                  <Ionicons name="add" size={20} className="text-foreground" />
                </TouchableOpacity>
              )}
            </View>

            {/* Teacher's Assigned Classes */}
            {user.role === "teacher" ? (
              assignments.length === 0 ? (
                <View className="p-8 items-center">
                  <Ionicons
                    name="book-outline"
                    size={48}
                    className="text-muted-foreground"
                  />
                  <Text className="text-muted-foreground text-center mt-4">
                    No classes assigned yet. Contact your administrator.
                  </Text>
                </View>
              ) : (
                <View className="gap-4">
                  {assignments.map((assignment) => {
                    const color = generateColorFromString(
                      assignment.class?.name || ""
                    );
                    const isPrimary = assignment.isPrimaryTeacher;

                    const studentCount =
                      classes.find((c) => c.id === assignment.classId)?.students
                        ?.length || 0;

                    return (
                      <Link
                        key={assignment.id}
                        href={`/class/${assignment.classId}`}
                        asChild
                      >
                        <TouchableOpacity className="flex-row p-4 rounded-xl bg-card border border-border gap-4">
                          <View
                            className="w-12 h-12 rounded-full justify-center items-center"
                            style={{ backgroundColor: color + "20" }}
                          >
                            <Ionicons name="school" size={24} color={color} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-lg font-semibold text-foreground mb-1">
                              {assignment.class?.name}
                            </Text>
                            <Text className="text-sm text-muted-foreground mb-1">
                              Grade {assignment.class?.grade} -{" "}
                              {assignment.class?.section}
                            </Text>
                            <Text className="text-xs text-muted-foreground mb-3">
                              Academic Year: {assignment.class?.academicYear}
                              {isPrimary && " • Primary Teacher"}
                            </Text>
                            <View className="flex-row justify-between items-center">
                              <View className="flex-row items-center gap-1">
                                <Ionicons
                                  name="people"
                                  size={16}
                                  className="text-muted-foreground"
                                />
                                <Text className="text-xs text-muted-foreground">
                                  {studentCount} students
                                </Text>
                              </View>
                              <TouchableOpacity
                                className="px-3 py-1.5 rounded-2xl"
                                style={{ backgroundColor: color }}
                                onPress={(e) => {
                                  e.preventDefault();
                                  router.push(
                                    `/attendance/${assignment.classId}`
                                  );
                                }}
                              >
                                <Text className="text-xs font-medium text-white">
                                  Take Attendance
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </Link>
                    );
                  })}
                </View>
              )
            ) : // Show classes for admin/principal
            classes.length === 0 ? (
              <View className="p-8 items-center">
                <Ionicons
                  name="school-outline"
                  size={48}
                  className="text-muted-foreground"
                />
                <Text className="text-muted-foreground text-center mt-4">
                  No classes found. Create your first class to get started.
                </Text>
              </View>
            ) : (
              <View className="gap-4">
                {classes.map((classItem) => {
                  const color = generateColorFromString(classItem.name);
                  const studentCount = classItem.students?.length || 0;

                  return (
                    <Link
                      key={classItem.id}
                      href={`/class/${classItem.id}`}
                      asChild
                    >
                      <TouchableOpacity className="flex-row p-4 rounded-xl bg-card border border-border gap-4">
                        <View
                          className="w-12 h-12 rounded-full justify-center items-center"
                          style={{ backgroundColor: color + "20" }}
                        >
                          <Ionicons name="book" size={24} color={color} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-foreground mb-1">
                            {classItem.name}
                          </Text>
                          <Text className="text-sm text-muted-foreground mb-1">
                            Grade {classItem.grade} - {classItem.section}
                          </Text>
                          <Text className="text-xs text-muted-foreground mb-3">
                            Academic Year: {classItem.academicYear}
                          </Text>
                          <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center gap-1">
                              <Ionicons
                                name="people"
                                size={16}
                                className="text-muted-foreground"
                              />
                              <Text className="text-xs text-muted-foreground">
                                {studentCount} students
                              </Text>
                            </View>
                            <TouchableOpacity
                              className="px-3 py-1.5 rounded-2xl"
                              style={{ backgroundColor: color }}
                              onPress={(e) => {
                                e.preventDefault();
                                router.push(`/class/${classItem.id}`);
                              }}
                            >
                              <Text className="text-xs font-medium text-white">
                                View Details
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Link>
                  );
                })}
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-foreground mb-4">
              Quick Actions
            </Text>
            <View className="flex-row gap-3">
              {user.role === "teacher" ? (
                // Teacher-specific actions
                <>
                  <TouchableOpacity
                    className="flex-1 p-4 rounded-xl bg-card border border-border items-center gap-2"
                    onPress={() => router.push("/my-attendance")}
                  >
                    <Ionicons name="calendar" size={24} color="#8b5cf6" />
                    <Text className="text-sm font-medium text-foreground text-center">
                      My Attendance
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 p-4 rounded-xl bg-card border border-border items-center gap-2"
                    onPress={() => router.push("/my-reports")}
                  >
                    <Ionicons name="analytics" size={24} color="#06b6d4" />
                    <Text className="text-sm font-medium text-foreground text-center">
                      My Reports
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Admin/Principal actions
                <>
                  <TouchableOpacity
                    className="flex-1 p-4 rounded-xl bg-card border border-border items-center gap-2"
                    onPress={() => router.push("/reports")}
                  >
                    <Ionicons name="analytics" size={24} color="#8b5cf6" />
                    <Text className="text-sm font-medium text-foreground text-center">
                      View Reports
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 p-4 rounded-xl bg-card border border-border items-center gap-2"
                    onPress={() => router.push("/teachers")}
                  >
                    <Ionicons name="people-circle" size={24} color="#06b6d4" />
                    <Text className="text-sm font-medium text-foreground text-center">
                      Manage Teachers
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
