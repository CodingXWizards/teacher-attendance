import {
  View,
  Text,
  Alert,
  TextInput,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  Search,
  AlertCircle,
  Users,
  Edit,
  BarChart3,
  MoreVertical,
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useMemo, useCallback, useEffect } from "react";

import { Appbar } from "@/components/appbar";
import ClassesService from "@/services/classes";
import { ClassWithDetails, Student } from "@/types";
import { AttendanceStatus } from "@/types/attendance";
import AttendanceService from "@/services/attendance";

// Extended student interface with attendance info
interface StudentWithAttendance extends Student {
  attendance?: {
    status: AttendanceStatus;
    lastPresent?: string;
    attendancePercentage: number;
  };
}

export default function ClassDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "present" | "absent"
  >("all");

  // State for class data
  const [classData, setClassData] = useState<ClassWithDetails | null>(null);
  const [classLoading, setClassLoading] = useState(true);
  const [classError, setClassError] = useState<string | null>(null);

  // State for attendance data
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // Fetch class details
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setClassLoading(true);
        setClassError(null);
        const data = await ClassesService.getClassWithDetails(id);
        setClassData(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load class details";
        setClassError(errorMessage);
        Alert.alert("Error", errorMessage);
      } finally {
        setClassLoading(false);
      }
    };

    if (id) {
      fetchClassData();
    }
  }, [id]);

  // Fetch attendance data when class data is loaded
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!classData) return;

      try {
        setAttendanceLoading(true);
        setAttendanceError(null);
        const today = new Date().toISOString().split("T")[0];
        const data = await AttendanceService.getStudentAttendanceByClassAndDate(
          id,
          today,
        );
        setTodayAttendance(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load attendance";
        setAttendanceError(errorMessage);
        console.warn("Failed to load today's attendance:", errorMessage);
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchAttendanceData();
  }, [classData, id]);

  // Refresh functions
  const refreshClass = useCallback(async () => {
    try {
      setClassLoading(true);
      setClassError(null);
      const data = await ClassesService.getClassWithDetails(id);
      setClassData(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load class details";
      setClassError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setClassLoading(false);
    }
  }, [id]);

  const refreshAttendance = useCallback(async () => {
    if (!classData) return;

    try {
      setAttendanceLoading(true);
      setAttendanceError(null);
      const today = new Date().toISOString().split("T")[0];
      const data = await AttendanceService.getStudentAttendanceByClassAndDate(
        id,
        today,
      );
      setTodayAttendance(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load attendance";
      setAttendanceError(errorMessage);
      console.warn("Failed to load today's attendance:", errorMessage);
    } finally {
      setAttendanceLoading(false);
    }
  }, [classData, id]);

  // Combined refresh function for pull-to-refresh
  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshClass(), refreshAttendance()]);
  }, [refreshClass, refreshAttendance]);

  // Combine class data with attendance information
  const studentsWithAttendance = useMemo(() => {
    if (!classData?.students) return [];

    return classData.students.map(student => {
      // Find today's attendance for this student
      const todayRecord = todayAttendance?.find(
        (att: any) => att.studentId === student.id,
      );

      // Calculate attendance percentage (mock calculation for now)
      // In a real app, you'd fetch attendance history and calculate this
      const attendancePercentage =
        todayRecord?.status === AttendanceStatus.PRESENT ? 95 : 85;

      return {
        ...student,
        attendance: {
          status: todayRecord?.status || AttendanceStatus.ABSENT,
          lastPresent:
            todayRecord?.status === AttendanceStatus.PRESENT
              ? new Date().toISOString().split("T")[0]
              : new Date(Date.now() - 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
          attendancePercentage,
        },
      } as StudentWithAttendance;
    });
  }, [classData?.students, todayAttendance]);

  // Filter students based on search and status
  const filteredStudents = useMemo(() => {
    return studentsWithAttendance.filter(student => {
      const matchesSearch =
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.includes(searchQuery);

      const matchesFilter =
        filterStatus === "all" || student.attendance?.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [studentsWithAttendance, searchQuery, filterStatus]);

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "#10b981";
      case AttendanceStatus.ABSENT:
        return "#ef4444";

      default:
        return "#94a3b8";
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "✓";
      case AttendanceStatus.ABSENT:
        return "✗";

      default:
        return "?";
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "Present";
      case AttendanceStatus.ABSENT:
        return "Absent";

      default:
        return "Unknown";
    }
  };

  // Loading state
  if (classLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading class details...</Text>
      </View>
    );
  }

  // Error state
  if (classError || !classData) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <AlertCircle size={32} color="#ef4444" />
        </View>
        <Text style={styles.errorText}>{classError || "Class not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshClass}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Appbar
          title={classData.grade}
          subtitle={`Section ${classData.section}`}
          trailing={
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Settings", "Settings not implemented yet")
              }
            >
              <MoreVertical size={24} color="#1f2937" />
            </TouchableOpacity>
          }
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={classLoading || attendanceLoading}
              onRefresh={handleRefresh}
              colors={["#8b5cf6"]}
              tintColor="#8b5cf6"
            />
          }
        >
          {/* Search and Filter */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Search size={18} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search students..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.filterContainer}>
              {(["all", "present", "absent"] as const).map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterButton,
                    filterStatus === status && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterStatus === status && styles.filterButtonTextActive,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Students List */}
          <View style={styles.studentsSection}>
            <View style={styles.studentsHeader}>
              <Text style={styles.studentsTitle}>Students</Text>
            </View>

            {attendanceLoading && (
              <View style={styles.loadingStudentsContainer}>
                <ActivityIndicator size="small" color="#8b5cf6" />
                <Text style={styles.loadingStudentsText}>
                  Loading attendance...
                </Text>
              </View>
            )}

            <View style={styles.studentsList}>
              {filteredStudents.map(student => (
                <TouchableOpacity
                  key={student.id}
                  style={styles.studentCard}
                  onPress={() =>
                    navigation.navigate("StudentDetails", {
                      studentId: student.id,
                    })
                  }
                >
                  <View style={styles.studentInfo}>
                    <View style={styles.studentHeader}>
                      <Text style={styles.studentName}>
                        {student.firstName} {student.lastName}
                      </Text>
                      {student.attendance && (
                        <View style={styles.statusContainer}>
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color: getStatusColor(
                                  student.attendance.status,
                                ),
                              },
                            ]}
                          >
                            {getStatusIcon(student.attendance.status)}{" "}
                            {getStatusText(student.attendance.status)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.studentId}>
                      ID: {student.studentId}
                    </Text>
                    <Text style={styles.studentEmail}>{student.email}</Text>
                    <View style={styles.studentFooter}>
                      {student.attendance && (
                        <>
                          <Text style={styles.attendanceInfo}>
                            Attendance:{" "}
                            {student.attendance.attendancePercentage}%
                          </Text>
                          <Text style={styles.lastPresentInfo}>
                            Last present: {student.attendance.lastPresent}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                      Alert.alert("Edit", "Edit student not implemented yet")
                    }
                  >
                    <Edit size={16} color="#6b7280" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>

            {filteredStudents.length === 0 && !attendanceLoading && (
              <View style={styles.emptyStudentsContainer}>
                <Users size={48} color="#6b7280" />
                <Text style={styles.emptyStudentsText}>
                  {searchQuery || filterStatus !== "all"
                    ? "No students match your search criteria"
                    : "No students in this class yet"}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.takeAttendanceButton}
              onPress={() =>
                navigation.navigate("TakeAttendance" as never, { id } as never)
              }
            >
              <Text style={styles.takeAttendanceIcon}>✓</Text>
              <Text style={styles.takeAttendanceText}>Take Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewReportsButton}
              onPress={() => navigation.navigate("Reports" as never)}
            >
              <BarChart3 size={24} color="#1f2937" />
              <Text style={styles.viewReportsText}>View Reports</Text>
            </TouchableOpacity>
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
    fontSize: 18,
    color: "#1f2937",
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
    width: 64,
    height: 64,
    backgroundColor: "#fef2f2",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: "#1f2937",
    marginTop: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#8b5cf6",
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#1f2937",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
  },
  filterButtonActive: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    color: "#1f2937",
  },
  filterButtonTextActive: {
    color: "#ffffff",
  },
  studentsSection: {
    marginBottom: 24,
  },
  studentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  studentsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  loadingStudentsContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loadingStudentsText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
  studentsList: {
    gap: 12,
  },
  studentCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  studentId: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  studentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  attendanceInfo: {
    fontSize: 12,
    color: "#6b7280",
  },
  lastPresentInfo: {
    fontSize: 12,
    color: "#6b7280",
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStudentsContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyStudentsText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  takeAttendanceButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    backgroundColor: "#8b5cf6",
  },
  takeAttendanceIcon: {
    color: "#ffffff",
    fontSize: 18,
  },
  takeAttendanceText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
  viewReportsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  viewReportsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
});
