import {
  Text,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  School,
  CheckCircle,
  XCircle,
  Clock,
  MinusCircle,
  BarChart3,
  Calendar as CalendarIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import { ClassesService, StudentsService } from "@/services";
import { Appbar } from "@/components/appbar";
import { Class, Student, StudentAttendance } from "@/types";
import { ScreenLoader } from "@/components/screen-loader";

const StudentScreen = () => {
  const route = useRoute();
  const { studentId } = route.params as { studentId: string };

  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      StudentsService.getStudentByStudentId(studentId),
      StudentsService.getStudentAttendance(studentId),
    ])
      .then(([studentRes, attendanceRes]) => {
        setStudentInfo(studentRes);
        setAttendance(attendanceRes);
        if (studentRes) {
          ClassesService.getClassById(studentRes.classId).then(classRes => {
            setStudentClass(classRes);
          });
        }
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
        setIsLoadingAttendance(false);
      });
  }, [studentId]);

  const calculateAttendanceStats = () => {
    if (!attendance.length)
      return { present: 0, absent: 0, total: 0, percentage: 0 };

    const present = attendance.filter(a => a.status === "present").length;
    const absent = attendance.filter(a => a.status === "absent").length;
    const total = attendance.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, total, percentage };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return styles.statusPresent;
      case "absent":
        return styles.statusAbsent;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "present":
        return styles.statusTextPresent;
      case "absent":
        return styles.statusTextAbsent;
      default:
        return styles.statusTextDefault;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return "✓";
      case "absent":
        return "✗";
      default:
        return "?";
    }
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatMonthYear = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Group attendance by month
  const groupAttendanceByMonth = () => {
    const grouped: { [key: string]: StudentAttendance[] } = {};

    attendance.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(record);
    });

    return grouped;
  };

  const groupedAttendance = groupAttendanceByMonth();

  const stats = calculateAttendanceStats();

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {studentInfo && (
        <View style={styles.content}>
          <Appbar title="Student Details" />

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.heroCard}>
                <View style={styles.heroHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {studentInfo.firstName.charAt(0)}
                      {studentInfo.lastName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.heroInfo}>
                    <Text style={styles.studentName}>
                      {studentInfo.firstName} {studentInfo.lastName}
                    </Text>
                    <Text style={styles.studentId}>
                      Student ID: {studentInfo.studentId}
                    </Text>
                    <View style={styles.classBadge}>
                      <School size={16} color="#2563eb" />
                      <Text style={styles.classBadgeText}>
                        {studentClass?.name || "Class not assigned"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Mail size={20} color="#2563eb" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{studentInfo.email}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, styles.infoIconGreen]}>
                    <Phone size={20} color="#16a34a" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{studentInfo.phone}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, styles.infoIconPurple]}>
                    <MapPin size={20} color="#8b5cf6" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>{studentInfo.address}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, styles.infoIconOrange]}>
                    <Calendar size={20} color="#f59e0b" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Date of Birth</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(studentInfo.dateOfBirth || "")}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, styles.infoIconPink]}>
                    <User size={20} color="#ec4899" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Gender</Text>
                    <Text style={styles.infoValue}>
                      {studentInfo.gender
                        ? studentInfo.gender.charAt(0).toUpperCase() +
                          studentInfo.gender.slice(1)
                        : "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Attendance Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attendance Overview</Text>
              <View style={styles.statsCard}>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                      <CheckCircle size={24} color="#16a34a" />
                      <Text style={styles.statNumber}>{stats.present}</Text>
                    </View>
                    <Text style={styles.statLabel}>Present</Text>
                  </View>

                  <View style={styles.statCardAbsent}>
                    <View style={styles.statHeader}>
                      <XCircle size={24} color="#ef4444" />
                      <Text style={styles.statNumberAbsent}>
                        {stats.absent}
                      </Text>
                    </View>
                    <Text style={styles.statLabelAbsent}>Absent</Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statCardTotal}>
                    <View style={styles.statHeader}>
                      <BarChart3 size={24} color="#2563eb" />
                      <Text style={styles.statNumberTotal}>{stats.total}</Text>
                    </View>
                    <Text style={styles.statLabelTotal}>Total</Text>
                  </View>
                </View>

                <View style={styles.attendanceRateCard}>
                  <View style={styles.rateHeader}>
                    <Text style={styles.rateTitle}>Attendance Rate</Text>
                    <Text style={styles.ratePercentage}>
                      {stats.percentage}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${stats.percentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.rateText}>
                    {stats.present} out of {stats.total} days attended
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Attendance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attendance Calendar</Text>
              <View style={styles.calendarContainer}>
                {isLoadingAttendance ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8b5cf6" />
                    <Text style={styles.loadingText}>
                      Loading attendance records...
                    </Text>
                  </View>
                ) : attendance.length > 0 ? (
                  <View style={styles.calendarList}>
                    {Object.entries(groupedAttendance)
                      .sort(([a], [b]) => b.localeCompare(a)) // Sort by month (newest first)
                      .slice(0, 3) // Show last 3 months
                      .map(([monthKey, monthAttendance]) => {
                        const firstDate = new Date(monthAttendance[0].date);
                        const monthName = formatMonthYear(
                          monthAttendance[0].date,
                        );

                        // Create a map of dates to attendance records
                        const attendanceMap = new Map();
                        monthAttendance.forEach(record => {
                          attendanceMap.set(record.date, record);
                        });

                        // Get all days in the month
                        const year = firstDate.getFullYear();
                        const month = firstDate.getMonth();
                        const daysInMonth = new Date(
                          year,
                          month + 1,
                          0,
                        ).getDate();
                        const firstDayOfMonth = new Date(
                          year,
                          month,
                          1,
                        ).getDay();

                        return (
                          <View key={monthKey} style={styles.monthCard}>
                            <Text style={styles.monthTitle}>{monthName}</Text>

                            {/* Calendar Grid */}
                            <View style={styles.calendarGrid}>
                              {/* Day headers */}
                              <View style={styles.dayHeaders}>
                                {[
                                  "Sun",
                                  "Mon",
                                  "Tue",
                                  "Wed",
                                  "Thu",
                                  "Fri",
                                  "Sat",
                                ].map(day => (
                                  <View key={day} style={styles.dayHeader}>
                                    <Text style={styles.dayHeaderText}>
                                      {day}
                                    </Text>
                                  </View>
                                ))}
                              </View>

                              {/* Calendar days */}
                              <View style={styles.calendarDays}>
                                {Array.from(
                                  {
                                    length: Math.ceil(
                                      (firstDayOfMonth + daysInMonth) / 7,
                                    ),
                                  },
                                  (_, weekIndex) => (
                                    <View
                                      key={weekIndex}
                                      style={styles.weekRow}
                                    >
                                      {Array.from(
                                        { length: 7 },
                                        (_, dayIndex) => {
                                          const dayNumber =
                                            weekIndex * 7 +
                                            dayIndex -
                                            firstDayOfMonth +
                                            1;
                                          const isValidDay =
                                            dayNumber > 0 &&
                                            dayNumber <= daysInMonth;

                                          if (!isValidDay) {
                                            return (
                                              <View
                                                key={dayIndex}
                                                style={styles.emptyDay}
                                              />
                                            );
                                          }

                                          const dateString = `${year}-${String(
                                            month + 1,
                                          ).padStart(2, "0")}-${String(
                                            dayNumber,
                                          ).padStart(2, "0")}`;
                                          const attendanceRecord =
                                            attendanceMap.get(dateString);
                                          const isToday =
                                            dateString ===
                                            new Date()
                                              .toISOString()
                                              .split("T")[0];

                                          return (
                                            <View
                                              key={dayIndex}
                                              style={styles.calendarDay}
                                            >
                                              {attendanceRecord ? (
                                                <View
                                                  style={[
                                                    styles.dayWithAttendance,
                                                    getStatusColor(
                                                      attendanceRecord.status,
                                                    ),
                                                    isToday &&
                                                      styles.todayBorder,
                                                  ]}
                                                >
                                                  <Text
                                                    style={styles.dayNumber}
                                                  >
                                                    {dayNumber}
                                                  </Text>
                                                </View>
                                              ) : (
                                                <View
                                                  style={[
                                                    styles.dayWithoutAttendance,
                                                    isToday &&
                                                      styles.todayHighlight,
                                                  ]}
                                                >
                                                  <Text
                                                    style={[
                                                      styles.dayNumberEmpty,
                                                      isToday &&
                                                        styles.todayText,
                                                    ]}
                                                  >
                                                    {dayNumber}
                                                  </Text>
                                                </View>
                                              )}
                                            </View>
                                          );
                                        },
                                      )}
                                    </View>
                                  ),
                                )}
                              </View>
                            </View>

                            {/* Legend */}
                            <View style={styles.legend}>
                              <View style={styles.legendItem}>
                                <View style={styles.legendDotPresent} />
                                <Text style={styles.legendText}>Present</Text>
                              </View>
                              <View style={styles.legendItem}>
                                <View style={styles.legendDotAbsent} />
                                <Text style={styles.legendText}>Absent</Text>
                              </View>
                              <View style={styles.legendItem}>
                                <View style={styles.legendDotToday} />
                                <Text style={styles.legendText}>Today</Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIcon}>
                      <CalendarIcon size={32} color="#9ca3af" />
                    </View>
                    <Text style={styles.emptyTitle}>No attendance records</Text>
                    <Text style={styles.emptyText}>
                      Attendance records will appear here once they are added.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {!studentInfo && !isLoading && (
        <View style={styles.notFoundContainer}>
          <View style={styles.notFoundIcon}>
            <User size={40} color="#9ca3af" />
          </View>
          <Text style={styles.notFoundTitle}>Student not found</Text>
          <Text style={styles.notFoundText}>
            The student you're looking for doesn't exist or has been removed
            from the system.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    backgroundColor: "#f8fafc",
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: "#8b5cf6",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  heroInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  studentId: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 8,
  },
  classBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  classBadgeText: {
    color: "#1d4ed8",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#dbeafe",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoIconGreen: {
    backgroundColor: "#dcfce7",
  },
  infoIconPurple: {
    backgroundColor: "#f3e8ff",
  },
  infoIconOrange: {
    backgroundColor: "#fed7aa",
  },
  infoIconPink: {
    backgroundColor: "#fce7f3",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    color: "#111827",
    fontSize: 16,
  },
  statsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  statCardAbsent: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  statCardTotal: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#16a34a",
  },
  statNumberAbsent: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ef4444",
  },
  statNumberTotal: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },
  statLabel: {
    color: "#16a34a",
    fontWeight: "500",
  },
  statLabelAbsent: {
    color: "#ef4444",
    fontWeight: "500",
  },
  statLabelTotal: {
    color: "#2563eb",
    fontWeight: "500",
  },
  attendanceRateCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  rateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  ratePercentage: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },
  progressBar: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 6,
    height: 12,
    marginBottom: 8,
  },
  progressFill: {
    backgroundColor: "#8b5cf6",
    height: 12,
    borderRadius: 6,
  },
  rateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  calendarContainer: {
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    color: "#6b7280",
    marginTop: 12,
    fontWeight: "500",
  },
  calendarList: {
    gap: 24,
  },
  monthCard: {
    flexDirection: "column",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 16,
    borderColor: "#e5e7eb",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  calendarGrid: {
    flexDirection: "column",
    gap: 8,
  },
  dayHeaders: {
    flexDirection: "row",
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  calendarDays: {
    gap: 8,
  },
  weekRow: {
    flexDirection: "row",
    gap: 8,
  },
  emptyDay: {
    flex: 1,
    aspectRatio: 1,
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
  },
  dayWithAttendance: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dayWithoutAttendance: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  todayBorder: {
    borderColor: "#3b82f6",
  },
  todayHighlight: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  dayNumber: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  dayNumberEmpty: {
    fontSize: 12,
    color: "#9ca3af",
  },
  todayText: {
    color: "#1d4ed8",
    fontWeight: "bold",
  },
  statusPresent: {
    backgroundColor: "#16a34a",
  },
  statusAbsent: {
    backgroundColor: "#ef4444",
  },
  statusDefault: {
    backgroundColor: "#d1d5db",
  },
  statusTextPresent: {
    color: "#16a34a",
  },
  statusTextAbsent: {
    color: "#ef4444",
  },
  statusTextDefault: {
    color: "#6b7280",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDotPresent: {
    width: 16,
    height: 16,
    backgroundColor: "#16a34a",
    borderRadius: 8,
    marginRight: 8,
  },
  legendDotAbsent: {
    width: 16,
    height: 16,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    marginRight: 8,
  },
  legendDotToday: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#6b7280",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#f3f4f6",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#111827",
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 18,
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  notFoundIcon: {
    width: 80,
    height: 80,
    backgroundColor: "#f3f4f6",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  notFoundText: {
    color: "#6b7280",
    textAlign: "center",
    fontSize: 18,
    lineHeight: 24,
  },
});

export default StudentScreen;
