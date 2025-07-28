import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import ClassesService from "@/services/classes";
import { ClassWithDetails, Student } from "@/types";
import AttendanceService from "@/services/attendance";
import { AttendanceStatus } from "@/types/attendance";
import { Appbar } from "@/components/appbar";

// Extended student interface with attendance info
interface StudentWithAttendance extends Student {
  attendanceStatus: AttendanceStatus;
}

export default function AttendancePage() {
  const { id } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for class data
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
        const data = await ClassesService.getClassWithDetails(id as string);
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

  // Initialize students with default attendance status when class data loads
  useEffect(() => {
    if (classData?.students) {
      const studentsWithAttendance: StudentWithAttendance[] =
        classData.students.map((student) => ({
          ...student,
          attendanceStatus: AttendanceStatus.PRESENT, // Default to present
        }));
      setStudents(studentsWithAttendance);
    }
  }, [classData]);

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "#10b981";
      case AttendanceStatus.ABSENT:
        return "#ef4444";
      case AttendanceStatus.LATE:
        return "#f59e0b";
      case AttendanceStatus.HALF_DAY:
        return "#8b5cf6";
      default:
        return "#94a3b8";
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "checkmark-circle";
      case AttendanceStatus.ABSENT:
        return "close-circle";
      case AttendanceStatus.LATE:
        return "time";
      case AttendanceStatus.HALF_DAY:
        return "remove-circle";
      default:
        return "help-circle";
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "Present";
      case AttendanceStatus.ABSENT:
        return "Absent";
      case AttendanceStatus.LATE:
        return "Late";
      case AttendanceStatus.HALF_DAY:
        return "Half Day";
      default:
        return "Unknown";
    }
  };

  const toggleStatus = (studentId: string) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.id === studentId) {
          const statusOrder = [
            AttendanceStatus.PRESENT,
            AttendanceStatus.LATE,
            AttendanceStatus.HALF_DAY,
            AttendanceStatus.ABSENT,
          ];
          const currentIndex = statusOrder.indexOf(student.attendanceStatus);
          const nextIndex = (currentIndex + 1) % statusOrder.length;
          return { ...student, attendanceStatus: statusOrder[nextIndex] };
        }
        return student;
      })
    );
  };

  const getAttendanceStats = () => {
    const present = students.filter(
      (s) => s.attendanceStatus === AttendanceStatus.PRESENT
    ).length;
    const absent = students.filter(
      (s) => s.attendanceStatus === AttendanceStatus.ABSENT
    ).length;
    const late = students.filter(
      (s) => s.attendanceStatus === AttendanceStatus.LATE
    ).length;
    const halfDay = students.filter(
      (s) => s.attendanceStatus === AttendanceStatus.HALF_DAY
    ).length;
    const total = students.length;
    const attendanceRate = (((present + late + halfDay) / total) * 100).toFixed(
      1
    );

    return { present, absent, late, halfDay, total, attendanceRate };
  };

  const handleSubmit = async () => {
    if (!classData) return;

    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      // Create attendance records for all students
      const attendanceData = students.map((student) => ({
        studentId: student.id,
        classId: classData.id,
        date: today,
        status: student.attendanceStatus,
        notes: "",
        markedBy: "current-user-id", // This should come from auth context
      }));

      await AttendanceService.bulkCreateStudentAttendance(attendanceData);

      Alert.alert("Success!", "Attendance has been recorded successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
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
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-lg text-foreground mt-4">
          Loading class details...
        </Text>
      </View>
    );
  }

  // Error state
  if (classError || !classData) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-5">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="text-lg text-foreground mt-4 text-center">
          {classError || "Class not found"}
        </Text>
        <TouchableOpacity
          className="mt-4 px-6 py-3 bg-primary rounded-xl"
          onPress={() => window.location.reload()}
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        <Appbar
          title={classData.grade}
          subtitle="Take Attendance"
          trailing={
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Date",
                  "Today's date: " + new Date().toLocaleDateString()
                )
              }
            >
              <Ionicons name="calendar" size={20} className="text-foreground" />
            </TouchableOpacity>
          }
        />
        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Attendance Stats */}
          <View className="p-5 rounded-xl bg-card border border-border mb-6">
            <Text className="text-lg font-bold text-foreground mb-4 text-center">
              Today's Attendance
            </Text>
            <View className="flex-row justify-around">
              <View className="items-center gap-2">
                <View className="w-10 h-10 rounded-full bg-green-100 justify-center items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
                <Text className="text-xl font-bold text-foreground">
                  {stats.present}
                </Text>
                <Text className="text-xs text-muted-foreground">Present</Text>
              </View>
              <View className="items-center gap-2">
                <View className="w-10 h-10 rounded-full bg-yellow-100 justify-center items-center">
                  <Ionicons name="time" size={20} color="#f59e0b" />
                </View>
                <Text className="text-xl font-bold text-foreground">
                  {stats.late}
                </Text>
                <Text className="text-xs text-muted-foreground">Late</Text>
              </View>
              <View className="items-center gap-2">
                <View className="w-10 h-10 rounded-full bg-purple-100 justify-center items-center">
                  <Ionicons name="remove-circle" size={20} color="#8b5cf6" />
                </View>
                <Text className="text-xl font-bold text-foreground">
                  {stats.halfDay}
                </Text>
                <Text className="text-xs text-muted-foreground">Half Day</Text>
              </View>
              <View className="items-center gap-2">
                <View className="w-10 h-10 rounded-full bg-red-100 justify-center items-center">
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                </View>
                <Text className="text-xl font-bold text-foreground">
                  {stats.absent}
                </Text>
                <Text className="text-xs text-muted-foreground">Absent</Text>
              </View>
            </View>
            <View className="mt-4 pt-4 border-t border-border">
              <View className="items-center">
                <View
                  className="w-12 h-12 rounded-full justify-center items-center"
                  style={{ backgroundColor: "#8b5cf6" + "20" }}
                >
                  <Ionicons name="trending-up" size={24} color="#8b5cf6" />
                </View>
                <Text className="text-2xl font-bold text-foreground mt-2">
                  {stats.attendanceRate}%
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Attendance Rate
                </Text>
              </View>
            </View>
          </View>

          {/* Students List */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-foreground">
                Students
              </Text>
              <Text className="text-sm text-muted-foreground">
                {stats.total} students
              </Text>
            </View>

            {studentsLoading && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#8b5cf6" />
                <Text className="text-sm text-muted-foreground mt-2">
                  Loading students...
                </Text>
              </View>
            )}

            <View className="gap-3">
              {students.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  className="flex-row p-4 rounded-xl bg-card border border-border gap-4 items-center"
                  onPress={() => toggleStatus(student.id)}
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      {student.firstName} {student.lastName}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      ID: {student.studentId}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-2">
                      <Ionicons
                        name={getStatusIcon(student.attendanceStatus) as any}
                        size={24}
                        color={getStatusColor(student.attendanceStatus)}
                      />
                      <Text
                        className="text-sm font-medium"
                        style={{
                          color: getStatusColor(student.attendanceStatus),
                        }}
                      >
                        {getStatusText(student.attendanceStatus)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="w-8 h-8 rounded-full border border-border justify-center items-center"
                      onPress={() => toggleStatus(student.id)}
                    >
                      <Ionicons
                        name="swap-horizontal"
                        size={16}
                        className="text-muted-foreground"
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {students.length === 0 && !studentsLoading && (
              <View className="py-8 items-center">
                <Ionicons
                  name="people-outline"
                  size={48}
                  className="text-muted-foreground"
                />
                <Text className="text-base text-muted-foreground mt-2 text-center">
                  No students in this class
                </Text>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View className="mb-5">
            <TouchableOpacity
              className={`flex-row items-center justify-center py-4 px-6 rounded-xl gap-2 ${
                isSubmitting ? "bg-muted-foreground" : ""
              }`}
              style={{
                backgroundColor: isSubmitting ? undefined : "#8b5cf6",
              }}
              onPress={handleSubmit}
              disabled={isSubmitting || students.length === 0}
            >
              {isSubmitting ? (
                <Text className="text-base font-semibold text-white">
                  Submitting...
                </Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text className="text-base font-semibold text-white">
                    Submit Attendance
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
