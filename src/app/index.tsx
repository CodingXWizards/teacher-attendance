import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import {
  User,
  School,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Plus,
  Book,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUserStore } from "@/stores/userStore";
import { Appbar } from "@/components/appbar";
import DashboardService from "@/services/dashboard";
import { ClassWithDetails, TeacherClass, Class } from "@/types";

// Interface for class summary from dashboard service
interface ClassSummary {
  id: string;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  studentCount: number;
  teacherCount: number;
  color: string;
}

export default function Home() {
  const { user } = useUserStore();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([]);
  const [assignments, setAssignments] = useState<TeacherClass[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading user...</Text>
      </View>
    );
  }

  const generateColorFromString = (str: string): string => {
    const colors = [
      "#3b82f6", // blue
      "#10b981", // emerald
      "#f59e0b", // amber
      "#ef4444", // red
      "#8b5cf6", // violet
      "#06b6d4", // cyan
      "#84cc16", // lime
      "#f97316", // orange
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user.role === "teacher") {
        // Load teacher-specific data
        const teacherDashboard = await DashboardService.getTeacherDashboard(
          user.id,
        );
        setClasses(teacherDashboard.classes);
        setAssignments(teacherDashboard.assignments);
      } else {
        // Load admin/principal data
        const allClassSummaries = await DashboardService.getAllClassSummaries();
        setClassSummaries(allClassSummaries);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load dashboard";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadDashboardData}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Appbar
          showBack={false}
          title={`Good morning, ${user.firstName}!`}
          subtitle={
            user.role === "teacher"
              ? "Here are your assigned classes for today"
              : "Here's an overview of your school today"
          }
          trailing={
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate("Profile" as never)}
            >
              <User size={24} color="#1f2937" />
            </TouchableOpacity>
          }
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {user.role === "teacher" ? (
              // Teacher-specific stats
              <>
                <View style={styles.statCard}>
                  <BookOpen size={24} color="#8b5cf6" />
                  <Text style={styles.statNumber}>{assignments.length}</Text>
                  <Text style={styles.statLabel}>Assigned Classes</Text>
                </View>
                <View style={styles.statCard}>
                  <Users size={24} color="#8b5cf6" />
                  <Text style={styles.statNumber}>
                    {classes.reduce(
                      (total, cls) => total + (cls.students?.length || 0),
                      0,
                    )}
                  </Text>
                  <Text style={styles.statLabel}>Total Students</Text>
                </View>
                <View style={styles.statCard}>
                  <Calendar size={24} color="#8b5cf6" />
                  <Text style={styles.statNumber}>{new Date().getDate()}</Text>
                  <Text style={styles.statLabel}>Today's Date</Text>
                </View>
              </>
            ) : (
              // Admin/Principal stats
              <>
                <View style={styles.statCard}>
                  <School size={24} color="#8b5cf6" />
                  <Text style={styles.statNumber}>{classSummaries.length}</Text>
                  <Text style={styles.statLabel}>Total Classes</Text>
                </View>
                <View style={styles.statCard}>
                  <Users size={24} color="#8b5cf6" />
                  <Text style={styles.statNumber}>
                    {classSummaries.reduce(
                      (total, cls) => total + cls.studentCount,
                      0,
                    )}
                  </Text>
                  <Text style={styles.statLabel}>Total Students</Text>
                </View>
                <View style={styles.statCard}>
                  <BookOpen size={24} color="#8b5cf6" />
                  <Text style={styles.statNumber}>
                    {classSummaries.reduce(
                      (total, cls) => total + cls.teacherCount,
                      0,
                    )}
                  </Text>
                  <Text style={styles.statLabel}>Active Teachers</Text>
                </View>
              </>
            )}
          </View>

          {/* Classes Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {user.role === "teacher" ? "Your Classes" : "All Classes"}
              </Text>
              {user.role !== "teacher" && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() =>
                    Alert.alert("Add Class", "Add class not implemented yet")
                  }
                >
                  <Plus size={20} color="#1f2937" />
                </TouchableOpacity>
              )}
            </View>

            {user.role === "teacher" ? (
              // Show assignments for teacher
              assignments.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Book size={48} color="#6b7280" />
                  <Text style={styles.emptyText}>
                    No classes assigned yet. Contact your administrator.
                  </Text>
                </View>
              ) : (
                <View style={styles.classesList}>
                  {assignments.map(assignment => {
                    const color = generateColorFromString(
                      assignment.class?.name || "",
                    );
                    const studentCount = 0; // Will be populated when we have ClassWithDetails

                    return (
                      <TouchableOpacity
                        key={assignment.id}
                        style={styles.classCard}
                        onPress={() =>
                          navigation.navigate(
                            "ClassDetails" as never,
                            { id: assignment.classId } as never,
                          )
                        }
                      >
                        <View
                          style={[
                            styles.classIcon,
                            { backgroundColor: color + "20" },
                          ]}
                        >
                          <Book size={24} color={color} />
                        </View>
                        <View style={styles.classInfo}>
                          <Text style={styles.className}>
                            {assignment.class?.name}
                          </Text>
                          <Text style={styles.classDetails}>
                            Grade {assignment.class?.grade} -{" "}
                            {assignment.class?.section}
                          </Text>
                          <Text style={styles.academicYear}>
                            Academic Year: {assignment.class?.academicYear}
                          </Text>
                          <View style={styles.classFooter}>
                            <View style={styles.studentCount}>
                              <Users size={16} color="#6b7280" />
                              <Text style={styles.studentCountText}>
                                {studentCount} students
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={[
                                styles.viewButton,
                                { backgroundColor: color },
                              ]}
                              onPress={() =>
                                navigation.navigate(
                                  "ClassDetails" as never,
                                  { id: assignment.classId } as never,
                                )
                              }
                            >
                              <Text style={styles.viewButtonText}>
                                View Details
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )
            ) : // Show classes for admin/principal
            classSummaries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <School size={48} color="#6b7280" />
                <Text style={styles.emptyText}>
                  No classes found. Create your first class to get started.
                </Text>
              </View>
            ) : (
              <View style={styles.classesList}>
                {classSummaries.map(classItem => {
                  const color = classItem.color;

                  return (
                    <TouchableOpacity
                      key={classItem.id}
                      style={styles.classCard}
                      onPress={() =>
                        navigation.navigate(
                          "ClassDetails" as never,
                          { id: classItem.id } as never,
                        )
                      }
                    >
                      <View
                        style={[
                          styles.classIcon,
                          { backgroundColor: color + "20" },
                        ]}
                      >
                        <Book size={24} color={color} />
                      </View>
                      <View style={styles.classInfo}>
                        <Text style={styles.className}>{classItem.name}</Text>
                        <Text style={styles.classDetails}>
                          Grade {classItem.grade} - {classItem.section}
                        </Text>
                        <Text style={styles.academicYear}>
                          Academic Year: {classItem.academicYear}
                        </Text>
                        <View style={styles.classFooter}>
                          <View style={styles.studentCount}>
                            <Users size={16} color="#6b7280" />
                            <Text style={styles.studentCountText}>
                              {classItem.studentCount} students
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.viewButton,
                              { backgroundColor: color },
                            ]}
                            onPress={() =>
                              navigation.navigate(
                                "ClassDetails" as never,
                                { id: classItem.id } as never,
                              )
                            }
                          >
                            <Text style={styles.viewButtonText}>
                              View Details
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate("Attendance" as never)}
              >
                <Calendar size={24} color="#8b5cf6" />
                <Text style={styles.quickActionText}>Take Attendance</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate("History" as never)}
              >
                <BarChart3 size={24} color="#8b5cf6" />
                <Text style={styles.quickActionText}>View History</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate("Teachers" as never)}
              >
                <Users size={24} color="#8b5cf6" />
                <Text style={styles.quickActionText}>Manage Teachers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate("Reports" as never)}
              >
                <BarChart3 size={24} color="#8b5cf6" />
                <Text style={styles.quickActionText}>Generate Reports</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  safeArea: {
    flex: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#6b7280",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#fef2f2",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorTitle: {
    color: "#1f2937",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
  },
  classesList: {
    gap: 16,
  },
  classCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 16,
    alignItems: "center",
  },
  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  classDetails: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  academicYear: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 12,
  },
  classFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  studentCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  studentCountText: {
    fontSize: 12,
    color: "#6b7280",
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ffffff",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    textAlign: "center",
  },
});
