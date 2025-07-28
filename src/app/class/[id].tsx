import {
  View,
  Text,
  Alert,
  TextInput,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
  const { id } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "present" | "absent" | "late"
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

  // Fetch attendance data when class data is loaded
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!classData) return;

      try {
        setAttendanceLoading(true);
        setAttendanceError(null);
        const today = new Date().toISOString().split("T")[0];
        const data = await AttendanceService.getStudentAttendanceByClassAndDate(
          id as string,
          today
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
      const data = await ClassesService.getClassWithDetails(id as string);
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
        id as string,
        today
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

    return classData.students.map((student) => {
      // Find today's attendance for this student
      const todayRecord = todayAttendance?.find(
        (att: any) => att.studentId === student.id
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
    return studentsWithAttendance.filter((student) => {
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
          onPress={refreshClass}
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <Appbar
          title={classData.grade}
          subtitle={`Section ${classData.section}`}
          trailing={
            <TouchableOpacity
              onPress={() => router.push(`/class/${id}/settings`)}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                className="text-foreground"
              />
            </TouchableOpacity>
          }
        />
        <ScrollView
          className="flex-1 px-4 py-4"
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
          <View className="mb-6">
            <View className="flex-row items-center px-4 py-3 rounded-xl border border-border mb-3">
              <Ionicons
                name="search"
                size={18}
                className="text-muted-foreground mr-3"
              />
              <TextInput
                className="flex-1 h-full text-base text-foreground placeholder:text-muted-foreground"
                placeholder="Search students..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View className="flex-row gap-2">
              {(["all", "present", "absent", "late"] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  className={`flex-1 py-2 px-3 rounded-2xl border ${
                    filterStatus === status
                      ? "bg-primary border-primary"
                      : "bg-card border-border"
                  }`}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text
                    className={`text-xs font-medium text-center ${
                      filterStatus === status ? "text-white" : "text-foreground"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Students List */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-foreground">
                Students
              </Text>
            </View>

            {attendanceLoading && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#8b5cf6" />
                <Text className="text-sm text-muted-foreground mt-2">
                  Loading attendance...
                </Text>
              </View>
            )}

            <View className="gap-3">
              {filteredStudents.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  className="flex-row p-4 rounded-xl bg-card border border-border gap-4"
                  onPress={() => router.push(`/class/student/${student.id}`)}
                >
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-base font-semibold text-foreground">
                        {student.firstName} {student.lastName}
                      </Text>
                      {student.attendance && (
                        <View className="flex-row items-center gap-1">
                          <Ionicons
                            name={
                              getStatusIcon(student.attendance.status) as any
                            }
                            size={16}
                            color={getStatusColor(student.attendance.status)}
                          />
                          <Text
                            className="text-xs font-medium"
                            style={{
                              color: getStatusColor(student.attendance.status),
                            }}
                          >
                            {getStatusText(student.attendance.status)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-muted-foreground mb-1">
                      ID: {student.studentId}
                    </Text>
                    <Text className="text-xs text-muted-foreground mb-2">
                      {student.email}
                    </Text>
                    <View className="flex-row justify-between">
                      {student.attendance && (
                        <>
                          <Text className="text-xs text-muted-foreground">
                            Attendance:{" "}
                            {student.attendance.attendancePercentage}%
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            Last present: {student.attendance.lastPresent}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    className="w-8 h-8 rounded-full border border-border justify-center items-center"
                    onPress={() => router.push(`/student/${student.id}/edit`)}
                  >
                    <Ionicons
                      name="create"
                      size={16}
                      className="text-muted-foreground"
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>

            {filteredStudents.length === 0 && !attendanceLoading && (
              <View className="py-8 items-center">
                <Ionicons
                  name="people-outline"
                  size={48}
                  className="text-muted-foreground"
                />
                <Text className="text-base text-muted-foreground mt-2 text-center">
                  {searchQuery || filterStatus !== "all"
                    ? "No students match your search criteria"
                    : "No students in this class yet"}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View className="flex-row gap-3 mb-5">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl gap-2"
              style={{ backgroundColor: "#8b5cf6" }}
              onPress={() => router.push(`/attendance/${id}`)}
            >
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text className="text-sm font-medium text-white">
                Take Attendance
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl bg-card border border-border gap-2"
              onPress={() => router.push(`/class/${id}/reports`)}
            >
              <Ionicons
                name="analytics"
                size={24}
                className="text-foreground"
              />
              <Text className="text-sm font-medium text-foreground">
                View Reports
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
