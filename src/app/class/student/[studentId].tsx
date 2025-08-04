import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import {
  Mail,
  Phone,
  MapPin,
  User,
  School,
  XCircle,
  Calendar,
  BarChart3,
  CheckCircle,
  Calendar as CalendarIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";

import { Appbar } from "@/components/appbar";
import { ScreenLoader } from "@/components/screen-loader";
import { Calendar as CalendarComponent } from "@/components/Calendar";
import { useTheme } from "@/contexts/ThemeContext";
import { Class, Student, StudentAttendance } from "@/types";
import { ClassesService, StudentsService } from "@/services";

const StudentScreen = () => {
  const route = useRoute();
  const { colors } = useTheme();
  const { studentId } = route.params as { studentId: string };

  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
        console.error(err);
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

  const formatDate = (dateString: string | number) => {
    const date =
      typeof dateString === "string"
        ? new Date(dateString)
        : new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const changeMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const stats = calculateAttendanceStats();

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {studentInfo && (
        <View style={styles.content}>
          <Appbar title="Student Details" />

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Hero Section */}
            <View style={{ marginBottom: 16 }}>
              <View
                style={[
                  styles.heroCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.heroHeader}>
                  <View
                    style={[styles.avatar, { backgroundColor: colors.primary }]}
                  >
                    <Text
                      style={[styles.avatarText, { color: colors.onPrimary }]}
                    >
                      {studentInfo.firstName.charAt(0)}
                      {studentInfo.lastName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.heroInfo}>
                    <Text style={[styles.studentName, { color: colors.text }]}>
                      {studentInfo.firstName} {studentInfo.lastName}
                    </Text>
                    <Text
                      style={[
                        styles.studentId,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Student ID: {studentInfo.studentId}
                    </Text>
                    <View
                      style={[
                        styles.classBadge,
                        { backgroundColor: colors.primaryContainer },
                      ]}
                    >
                      <School size={16} color={colors.primary} />
                      <Text
                        style={[
                          styles.classBadgeText,
                          { color: colors.primary },
                        ]}
                      >
                        {studentClass?.name || "Class not assigned"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Personal Information
              </Text>
              <View
                style={[
                  styles.infoCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.infoRow,
                    { backgroundColor: colors.surfaceElevated },
                  ]}
                >
                  <View
                    style={[
                      styles.infoIcon,
                      { backgroundColor: colors.primaryContainer },
                    ]}
                  >
                    <Mail size={20} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Email
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {studentInfo.email}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoRow,
                    { backgroundColor: colors.surfaceElevated },
                  ]}
                >
                  <View
                    style={[
                      styles.infoIcon,
                      { backgroundColor: colors.successContainer },
                    ]}
                  >
                    <Phone size={20} color={colors.success} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Phone
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {studentInfo.phone}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoRow,
                    { backgroundColor: colors.surfaceElevated },
                  ]}
                >
                  <View
                    style={[
                      styles.infoIcon,
                      { backgroundColor: colors.secondaryContainer },
                    ]}
                  >
                    <MapPin size={20} color={colors.secondary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Address
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {studentInfo.address}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoRow,
                    { backgroundColor: colors.surfaceElevated },
                  ]}
                >
                  <View
                    style={[
                      styles.infoIcon,
                      { backgroundColor: colors.warningContainer },
                    ]}
                  >
                    <Calendar size={20} color={colors.warning} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Date of Birth
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {formatDate(studentInfo.dateOfBirth || "")}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoRow,
                    { backgroundColor: colors.surfaceElevated },
                  ]}
                >
                  <View
                    style={[
                      styles.infoIcon,
                      { backgroundColor: colors.secondaryContainer },
                    ]}
                  >
                    <User size={20} color={colors.secondary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Gender
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Attendance Overview
              </Text>
              <View
                style={[
                  styles.statsCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.statsRow}>
                  <View
                    style={[
                      styles.statCard,
                      {
                        backgroundColor: colors.successContainer,
                        borderColor: colors.success,
                      },
                    ]}
                  >
                    <View style={styles.statHeader}>
                      <CheckCircle size={24} color={colors.success} />
                      <Text
                        style={[styles.statNumber, { color: colors.success }]}
                      >
                        {stats.present}
                      </Text>
                    </View>
                    <Text style={[styles.statLabel, { color: colors.success }]}>
                      Present
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statCardAbsent,
                      {
                        backgroundColor: colors.errorContainer,
                        borderColor: colors.error,
                      },
                    ]}
                  >
                    <View style={styles.statHeader}>
                      <XCircle size={24} color={colors.error} />
                      <Text
                        style={[
                          styles.statNumberAbsent,
                          { color: colors.error },
                        ]}
                      >
                        {stats.absent}
                      </Text>
                    </View>
                    <Text
                      style={[styles.statLabelAbsent, { color: colors.error }]}
                    >
                      Absent
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View
                    style={[
                      styles.statCardTotal,
                      {
                        backgroundColor: colors.primaryContainer,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <View style={styles.statHeader}>
                      <BarChart3 size={24} color={colors.primary} />
                      <Text
                        style={[
                          styles.statNumberTotal,
                          { color: colors.primary },
                        ]}
                      >
                        {stats.total}
                      </Text>
                    </View>
                    <Text
                      style={[styles.statLabelTotal, { color: colors.primary }]}
                    >
                      Total
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.attendanceRateCard,
                    { borderColor: colors.border },
                  ]}
                >
                  <View style={styles.rateHeader}>
                    <Text style={[styles.rateTitle, { color: colors.text }]}>
                      Attendance Rate
                    </Text>
                    <Text
                      style={[styles.ratePercentage, { color: colors.primary }]}
                    >
                      {stats.percentage}%
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${stats.percentage}%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.rateText, { color: colors.textSecondary }]}
                  >
                    {stats.present} out of {stats.total} days attended
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Attendance */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Attendance Calendar
              </Text>
              <View style={styles.calendarContainer}>
                {isLoadingAttendance ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text
                      style={[
                        styles.loadingText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Loading attendance records...
                    </Text>
                  </View>
                ) : attendance.length > 0 ? (
                  <CalendarComponent
                    currentMonth={currentMonth}
                    attendanceData={attendance.map(att => ({
                      date: att.date,
                      status: att.status,
                    }))}
                    onMonthChange={changeMonth}
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <View
                      style={[
                        styles.emptyIcon,
                        { backgroundColor: colors.surfaceVariant },
                      ]}
                    >
                      <CalendarIcon size={32} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                      No attendance records
                    </Text>
                    <Text
                      style={[
                        styles.emptyText,
                        { color: colors.textSecondary },
                      ]}
                    >
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
        <View
          style={[
            styles.notFoundContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[
              styles.notFoundIcon,
              { backgroundColor: colors.surfaceVariant },
            ]}
          >
            <User size={40} color={colors.textSecondary} />
          </View>
          <Text style={[styles.notFoundTitle, { color: colors.text }]}>
            Student not found
          </Text>
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
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
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
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
    fontSize: 24,
    fontWeight: "bold",
  },
  heroInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    marginBottom: 8,
  },
  classBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  classBadgeText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoIconGreen: {
    // Handled dynamically
  },
  infoIconPurple: {
    // Handled dynamically
  },
  infoIconOrange: {
    // Handled dynamically
  },
  infoIconPink: {
    // Handled dynamically
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
    borderWidth: 1,
  },
  statCardAbsent: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statCardTotal: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
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
  },
  statNumberAbsent: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statNumberTotal: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontWeight: "500",
  },
  statLabelAbsent: {
    fontWeight: "500",
  },
  statLabelTotal: {
    fontWeight: "500",
  },
  attendanceRateCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
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
  },
  ratePercentage: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressBar: {
    width: "100%",
    borderRadius: 6,
    height: 12,
    marginBottom: 8,
  },
  progressFill: {
    height: 12,
    borderRadius: 6,
  },
  rateText: {
    fontSize: 14,
    textAlign: "center",
  },
  calendarContainer: {
    // Handled dynamically
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
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
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
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
  },
  dayWithoutAttendance: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  todayBorder: {
    // Handled dynamically
  },
  todayHighlight: {
    // Handled dynamically
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: "bold",
  },
  dayNumberEmpty: {
    fontSize: 12,
  },
  todayText: {
    // Handled dynamically
  },
  statusPresent: {
    // Handled dynamically
  },
  statusAbsent: {
    // Handled dynamically
  },
  statusDefault: {
    // Handled dynamically
  },
  statusTextPresent: {
    // Handled dynamically
  },
  statusTextAbsent: {
    // Handled dynamically
  },
  statusTextDefault: {
    // Handled dynamically
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDotPresent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendDotAbsent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendDotToday: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 18,
  },
  emptyText: {
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
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  notFoundText: {
    textAlign: "center",
    fontSize: 18,
    lineHeight: 24,
  },
});

export default StudentScreen;
