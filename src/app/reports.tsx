import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  Filter,
  X,
} from "lucide-react-native";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Appbar } from "@/components/appbar";
import { DatabaseService } from "@/services/databaseService";
import { AttendanceStatus } from "@/types/attendance";

interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  total: number;
  attendanceRate: number;
}

interface StudentAttendanceData {
  studentId: string;
  studentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendanceRate: number;
}

interface DateRange {
  label: string;
  startDate: string;
  endDate: string;
}

export default function ReportsPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { classId } = route.params as { classId: string };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [studentAttendanceData, setStudentAttendanceData] = useState<
    StudentAttendanceData[]
  >([]);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(
    null,
  );
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Date range options
  const dateRanges: DateRange[] = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    return [
      {
        label: "Today",
        startDate: today.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      },
      {
        label: "Yesterday",
        startDate: yesterday.toISOString().split("T")[0],
        endDate: yesterday.toISOString().split("T")[0],
      },
      {
        label: "Last 7 Days",
        startDate: last7Days.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      },
      {
        label: "Last 30 Days",
        startDate: last30Days.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      },
      {
        label: "Last Month",
        startDate: lastMonth.toISOString().split("T")[0],
        endDate: lastMonthEnd.toISOString().split("T")[0],
      },
    ];
  }, []);

  // Load initial data
  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);

  // Load data when date range changes
  useEffect(() => {
    if (selectedDateRange) {
      loadAttendanceData();
    }
  }, [selectedDateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load class data
      const classInfo = await DatabaseService.getClassById(classId);
      setClassData(classInfo);

      // Load students
      const classStudents = await DatabaseService.getClassStudents(classId);
      setStudents(classStudents);

      // Set default date range to last 7 days
      setSelectedDateRange(dateRanges[2]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load data";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    if (!selectedDateRange) return;

    try {
      setLoading(true);

      const { startDate, endDate } = selectedDateRange;

      // Get attendance data for the date range
      const attendanceRecords =
        await DatabaseService.getStudentAttendanceByDateRange(
          classId,
          startDate,
          endDate,
        );
      // Process attendance data by date
      const attendanceByDate = new Map<string, AttendanceData>();

      // Initialize dates in range
      const currentDate = new Date(startDate);
      const endDateObj = new Date(endDate);

      while (currentDate <= endDateObj) {
        const dateStr = currentDate.toISOString().split("T")[0];
        attendanceByDate.set(dateStr, {
          date: dateStr,
          present: 0,
          absent: 0,
          total: students.length,
          attendanceRate: 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Count attendance by date
      attendanceRecords.forEach(record => {
        const dateData = attendanceByDate.get(record.date);
        if (dateData) {
          if (record.status === AttendanceStatus.PRESENT) {
            dateData.present++;
          } else if (record.status === AttendanceStatus.ABSENT) {
            dateData.absent++;
          }
          dateData.attendanceRate = (dateData.present / dateData.total) * 100;
        }
      });

      setAttendanceData(Array.from(attendanceByDate.values()));

      // Process student attendance data
      const studentAttendanceMap = new Map<string, StudentAttendanceData>();

      students.forEach(student => {
        studentAttendanceMap.set(student.studentId, {
          studentId: student.studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          attendanceRate: 0,
        });
      });

      attendanceRecords.forEach(record => {
        const studentData = studentAttendanceMap.get(record.studentId);
        if (studentData) {
          studentData.totalDays++;
          if (record.status === AttendanceStatus.PRESENT) {
            studentData.presentDays++;
          } else if (record.status === AttendanceStatus.ABSENT) {
            studentData.absentDays++;
          }
        }
      });

      // Calculate attendance rates
      studentAttendanceMap.forEach(studentData => {
        if (studentData.totalDays > 0) {
          studentData.attendanceRate =
            (studentData.presentDays / studentData.totalDays) * 100;
        }
      });

      setStudentAttendanceData(Array.from(studentAttendanceMap.values()));
    } catch (error) {
      console.error("Error loading attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateRange = () => {
    if (!customStartDate || !customEndDate) {
      Alert.alert("Error", "Please select both start and end dates");
      return;
    }

    if (new Date(customStartDate) > new Date(customEndDate)) {
      Alert.alert("Error", "Start date cannot be after end date");
      return;
    }

    const customRange: DateRange = {
      label: "Custom Range",
      startDate: customStartDate,
      endDate: customEndDate,
    };

    setSelectedDateRange(customRange);
    setShowCustomDatePicker(false);
  };

  const getOverallStats = () => {
    if (attendanceData.length === 0)
      return { totalPresent: 0, totalAbsent: 0, averageRate: 0 };

    const totalPresent = attendanceData.reduce(
      (sum, day) => sum + day.present,
      0,
    );
    const totalAbsent = attendanceData.reduce(
      (sum, day) => sum + day.absent,
      0,
    );
    const averageRate =
      attendanceData.reduce((sum, day) => sum + day.attendanceRate, 0) /
      attendanceData.length;

    return {
      totalPresent,
      totalAbsent,
      averageRate: Math.round(averageRate * 10) / 10,
    };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const overallStats = getOverallStats();

  if (loading && !classData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  if (error || !classData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || "Failed to load class data"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Appbar
          title="Attendance Reports"
          subtitle={classData?.name || "Class Reports"}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Range Selector */}
          <View style={styles.dateRangeSection}>
            <View style={styles.dateRangeHeader}>
              <Calendar size={20} color="#1f2937" />
              <Text style={styles.dateRangeTitle}>Date Range</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dateRangeScroll}
            >
              {dateRanges.map((range, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateRangeButton,
                    selectedDateRange?.label === range.label &&
                      styles.dateRangeButtonActive,
                  ]}
                  onPress={() => setSelectedDateRange(range)}
                >
                  <Text
                    style={[
                      styles.dateRangeButtonText,
                      selectedDateRange?.label === range.label &&
                        styles.dateRangeButtonTextActive,
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.dateRangeButton,
                  selectedDateRange?.label === "Custom Range" &&
                    styles.dateRangeButtonActive,
                ]}
                onPress={() => setShowCustomDatePicker(true)}
              >
                <Text
                  style={[
                    styles.dateRangeButtonText,
                    selectedDateRange?.label === "Custom Range" &&
                      styles.dateRangeButtonTextActive,
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {selectedDateRange && (
              <Text style={styles.dateRangeInfo}>
                {selectedDateRange.startDate} to {selectedDateRange.endDate}
              </Text>
            )}
          </View>

          {/* Overall Statistics */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Overall Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <CheckCircle size={24} color="#10b981" />
                <Text style={styles.statNumber}>
                  {overallStats.totalPresent}
                </Text>
                <Text style={styles.statLabel}>Total Present</Text>
              </View>
              <View style={styles.statItem}>
                <XCircle size={24} color="#ef4444" />
                <Text style={styles.statNumber}>
                  {overallStats.totalAbsent}
                </Text>
                <Text style={styles.statLabel}>Total Absent</Text>
              </View>
              <View style={styles.statItem}>
                <TrendingUp size={24} color="#8b5cf6" />
                <Text style={styles.statNumber}>
                  {overallStats.averageRate}%
                </Text>
                <Text style={styles.statLabel}>Average Rate</Text>
              </View>
            </View>
          </View>

          {/* Daily Attendance Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Daily Attendance Trend</Text>
            <ScrollView
              style={styles.chartContainer}
              showsVerticalScrollIndicator={false}
            >
              {attendanceData.length > 0 ? (
                <View style={styles.barChart}>
                  {attendanceData.map((day, index) => (
                    <View key={day.date} style={styles.barContainer}>
                      <View style={styles.barLabels}>
                        <Text style={styles.barDate}>
                          {formatDate(day.date)}
                        </Text>
                        <Text style={styles.barRate}>
                          {Math.round(day.attendanceRate)}%
                        </Text>
                      </View>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${day.attendanceRate}%`,
                              backgroundColor:
                                day.attendanceRate >= 80
                                  ? "#10b981"
                                  : day.attendanceRate >= 60
                                  ? "#f59e0b"
                                  : "#ef4444",
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <BarChart3 size={48} color="#6b7280" />
                  <Text style={styles.noDataText}>
                    No attendance data for selected period
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Student Performance */}
          <View style={styles.studentsCard}>
            <Text style={styles.studentsTitle}>Student Performance</Text>
            <ScrollView
              style={styles.studentsList}
              showsVerticalScrollIndicator={false}
            >
              {studentAttendanceData
                .sort((a, b) => b.attendanceRate - a.attendanceRate)
                .map((student, index) => (
                  <View key={student.studentId} style={styles.studentRow}>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>
                        {student.studentName}
                      </Text>
                      <Text style={styles.studentStats}>
                        {student.presentDays} present, {student.absentDays}{" "}
                        absent
                      </Text>
                    </View>
                    <View style={styles.studentRate}>
                      <Text
                        style={[
                          styles.rateText,
                          {
                            color:
                              student.attendanceRate >= 80
                                ? "#10b981"
                                : student.attendanceRate >= 60
                                ? "#f59e0b"
                                : "#ef4444",
                          },
                        ]}
                      >
                        {Math.round(student.attendanceRate)}%
                      </Text>
                    </View>
                  </View>
                ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Custom Date Range Modal */}
        <Modal
          visible={showCustomDatePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCustomDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Custom Date Range</Text>
                <TouchableOpacity
                  onPress={() => setShowCustomDatePicker(false)}
                  style={styles.closeButton}
                >
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.dateInputContainer}>
                <Text style={styles.dateInputLabel}>Start Date</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="YYYY-MM-DD"
                  value={customStartDate}
                  onChangeText={setCustomStartDate}
                />
              </View>

              <View style={styles.dateInputContainer}>
                <Text style={styles.dateInputLabel}>End Date</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="YYYY-MM-DD"
                  value={customEndDate}
                  onChangeText={setCustomEndDate}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowCustomDatePicker(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleCustomDateRange}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  loadingContainer: {
    flex: 1,
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#8b5cf6",
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  dateRangeSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dateRangeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  dateRangeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  dateRangeScroll: {
    marginBottom: 8,
  },
  dateRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  dateRangeButtonActive: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
  },
  dateRangeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  dateRangeButtonTextActive: {
    color: "#ffffff",
  },
  dateRangeInfo: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  statsCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  chartCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  chartContainer: {
    maxHeight: 200,
  },
  barChart: {
    gap: 12,
  },
  barContainer: {
    gap: 4,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  barRate: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1f2937",
  },
  barTrack: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  studentsCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  studentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  studentsList: {
    display: "flex",
    flexDirection: "column",
    maxHeight: 240,
    overflow: "scroll",
  },
  studentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  studentStats: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  studentRate: {
    alignItems: "flex-end",
  },
  rateText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  closeButton: {
    padding: 5,
  },
  dateInputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#ef4444",
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  applyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
  },
  applyButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButtonText: {
    fontSize: 16,
    color: "#1f2937",
    marginLeft: 8,
  },
});
