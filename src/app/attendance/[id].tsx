import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  CheckCircle,
  XCircle,
  Clock,
  MinusCircle,
  HelpCircle,
  Calendar,
  TrendingUp,
  ArrowLeftRight,
  Users,
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import ClassesService from "@/services/classes";
import { ClassWithDetails, Student } from "@/types";
import AttendanceService from "@/services/attendance";
import { AttendanceStatus } from "@/types/attendance";
import { Appbar } from "@/components/appbar";
import { DatabaseService } from "@/services/databaseService";
import { useUserStore } from "../../stores/userStore";

// Extended student interface with attendance info
interface StudentWithAttendance extends Student {
  attendanceStatus: AttendanceStatus;
  attendanceTaken: boolean;
}

export default function AttendancePage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for class data
  const { user } = useUserStore();
  const [classData, setClassData] = useState<ClassWithDetails | null>(null);
  const [classLoading, setClassLoading] = useState(true);
  const [classError, setClassError] = useState<string | null>(null);

  // State for students with attendance
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

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

  // Initialize students with today's attendance status when class data loads
  useEffect(() => {
    const initializeStudentsWithAttendance = async () => {
      if (classData?.students) {
        setStudentsLoading(true);
        try {
          // Fetch today's attendance for this class
          const todayAttendance =
            await DatabaseService.getTodayAttendanceForClass(id);
          console.log("todayAttendance", todayAttendance);
          const studentsWithAttendance: StudentWithAttendance[] =
            classData.students.map(student => {
              // Find today's attendance for this student
              const studentAttendance = todayAttendance.find(
                attendance => attendance.studentId === student.id,
              );

              return {
                ...student,
                attendanceStatus: studentAttendance
                  ? (studentAttendance.status as AttendanceStatus)
                  : AttendanceStatus.PRESENT, // Default to present if no attendance taken
                attendanceTaken: !!studentAttendance,
              };
            });

          setStudents(studentsWithAttendance);
        } catch (error) {
          console.error("Error fetching today's attendance:", error);
          // Fallback: initialize with default values
          const studentsWithAttendance: StudentWithAttendance[] =
            classData.students.map(student => ({
              ...student,
              attendanceStatus: AttendanceStatus.PRESENT,
              attendanceTaken: false,
            }));
          setStudents(studentsWithAttendance);
        } finally {
          setStudentsLoading(false);
        }
      }
    };

    if (classData?.students) {
      initializeStudentsWithAttendance();
    }
  }, [classData, id]);

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
        return CheckCircle;
      case AttendanceStatus.ABSENT:
        return XCircle;
      default:
        return HelpCircle;
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

  const toggleStatus = (studentId: string) => {
    setStudents(prevStudents =>
      prevStudents.map(student => {
        if (student.id === studentId) {
          const statusOrder = [
            AttendanceStatus.PRESENT,
            AttendanceStatus.ABSENT,
          ];
          const currentIndex = statusOrder.indexOf(student.attendanceStatus);
          const nextIndex = (currentIndex + 1) % statusOrder.length;
          return {
            ...student,
            attendanceStatus: statusOrder[nextIndex],
            attendanceTaken: false, // Mark as not taken since we're changing it
          };
        }
        return student;
      }),
    );
  };

  const getAttendanceStats = () => {
    const present = students.filter(
      s => s.attendanceStatus === AttendanceStatus.PRESENT,
    ).length;
    const absent = students.filter(
      s => s.attendanceStatus === AttendanceStatus.ABSENT,
    ).length;
    const total = students.length;
    const attendanceRate =
      total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
    const attendanceTaken = students.filter(s => s.attendanceTaken).length;

    return { present, absent, total, attendanceRate, attendanceTaken };
  };

  const handleSubmit = async () => {
    if (!classData) return;

    setIsSubmitting(true);

    if (!user) {
      Alert.alert("Error", "User not found");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];

      // Create or update attendance records for all students
      console.log("students", students);
      console.log("classData", id);
      const attendanceData = students.map(student => ({
        studentId: student.id,
        classId: id,
        date: today,
        status: student.attendanceStatus,
        notes: "",
        markedBy: user.id, // This should come from auth context
      }));

      await AttendanceService.bulkCreateOrUpdateStudentAttendance(
        attendanceData,
      );

      // Update students to mark attendance as taken
      setStudents(prevStudents =>
        prevStudents.map(student => ({
          ...student,
          attendanceTaken: true,
        })),
      );

      Alert.alert("Success!", "Attendance has been recorded successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit attendance";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = getAttendanceStats();

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
          <XCircle size={32} color="#ef4444" />
        </View>
        <Text style={styles.errorText}>{classError || "Class not found"}</Text>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Appbar
          title={classData.grade}
          subtitle="Take Attendance"
          trailing={
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Date",
                  "Today's date: " + new Date().toLocaleDateString(),
                )
              }
            >
              <Calendar size={20} color="#1f2937" />
            </TouchableOpacity>
          }
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Attendance Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Today's Attendance</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <CheckCircle size={20} color="#10b981" />
                </View>
                <Text style={styles.statNumber}>{stats.present}</Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <XCircle size={20} color="#ef4444" />
                </View>
                <Text style={styles.statNumber}>{stats.absent}</Text>
                <Text style={styles.statLabel}>Absent</Text>
              </View>
            </View>
            <View style={styles.attendanceRateContainer}>
              <View style={styles.attendanceRateIconContainer}>
                <TrendingUp size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.attendanceRate}>{stats.attendanceRate}%</Text>
              <Text style={styles.attendanceRateLabel}>Attendance Rate</Text>
            </View>

            {/* Attendance Status Indicator */}
            <View style={styles.attendanceStatusContainer}>
              <Text style={styles.attendanceStatusText}>
                {stats.attendanceTaken === stats.total
                  ? "✅ Attendance completed for today"
                  : stats.attendanceTaken > 0
                  ? `⚠️ Partial attendance taken (${stats.attendanceTaken}/${stats.total})`
                  : "⏰ Attendance not taken yet"}
              </Text>
            </View>
          </View>

          {/* Students List */}
          <View style={styles.studentsSection}>
            <View style={styles.studentsHeader}>
              <Text style={styles.studentsTitle}>Students</Text>
              <Text style={styles.studentsCount}>{stats.total} students</Text>
            </View>

            {studentsLoading && (
              <View style={styles.loadingStudentsContainer}>
                <ActivityIndicator size="small" color="#8b5cf6" />
                <Text style={styles.loadingStudentsText}>
                  Loading students...
                </Text>
              </View>
            )}

            <View style={styles.studentsList}>
              {students.map(student => {
                const StatusIcon = getStatusIcon(student.attendanceStatus);
                return (
                  <TouchableOpacity
                    key={student.id}
                    style={[
                      styles.studentCard,
                      student.attendanceTaken &&
                        styles.studentCardAttendanceTaken,
                    ]}
                    onPress={() => toggleStatus(student.id)}
                  >
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>
                        {student.firstName} {student.lastName}
                      </Text>
                      <Text style={styles.studentId}>
                        ID: {student.studentId}
                      </Text>
                      {student.attendanceTaken && (
                        <Text style={styles.attendanceTakenText}>
                          ✅ Attendance recorded
                        </Text>
                      )}
                    </View>
                    <View style={styles.studentStatus}>
                      <View style={styles.statusInfo}>
                        <StatusIcon
                          size={24}
                          color={getStatusColor(student.attendanceStatus)}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(student.attendanceStatus) },
                          ]}
                        >
                          {getStatusText(student.attendanceStatus)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => toggleStatus(student.id)}
                      >
                        <ArrowLeftRight size={16} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {students.length === 0 && !studentsLoading && (
              <View style={styles.emptyStudentsContainer}>
                <Users size={48} color="#6b7280" />
                <Text style={styles.emptyStudentsText}>
                  No students in this class
                </Text>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || students.length === 0}
            >
              {isSubmitting ? (
                <Text style={styles.submitButtonText}>Saving...</Text>
              ) : (
                <>
                  <CheckCircle size={24} color="white" />
                  <Text style={styles.submitButtonText}>
                    {stats.attendanceTaken > 0
                      ? "Update Attendance"
                      : "Save Attendance"}
                  </Text>
                </>
              )}
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
  goBackButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#8b5cf6",
    borderRadius: 12,
  },
  goBackButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  statsCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  attendanceRateContainer: {
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  attendanceRateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8b5cf620",
  },
  attendanceRate: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
  },
  attendanceRateLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  attendanceStatusContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "center",
  },
  attendanceStatusText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
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
  studentsCount: {
    fontSize: 14,
    color: "#6b7280",
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
    alignItems: "center",
  },
  studentCardAttendanceTaken: {
    opacity: 0.7, // Indicate that attendance is already taken
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    color: "#6b7280",
  },
  attendanceTakenText: {
    fontSize: 12,
    color: "#10b981",
    marginTop: 4,
    fontWeight: "500",
  },
  studentStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  toggleButton: {
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
  submitSection: {
    marginBottom: 20,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    backgroundColor: "#8b5cf6",
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
