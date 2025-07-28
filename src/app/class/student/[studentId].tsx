import {
  Text,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
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
  Calendar as CalendarIcon
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import { StudentsService } from "@/services";
import { Appbar } from "@/components/appbar";
import { Student, StudentAttendance } from "@/types";
import { ScreenLoader } from "@/components/screen-loader";

const StudentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { studentId } = route.params as { studentId: string };

  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      StudentsService.getStudentById(studentId),
      StudentsService.getStudentAttendance(studentId),
    ])
      .then(([studentRes, attendanceRes]) => {
        setStudentInfo(studentRes);
        setAttendance(attendanceRes);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
        setIsLoadingAttendance(false);
      });
  }, [studentId]);

  const calculateAttendanceStats = () => {
    if (!attendance.length)
      return { present: 0, absent: 0, late: 0, total: 0, percentage: 0 };

    const present = attendance.filter((a) => a.status === "present").length;
    const absent = attendance.filter((a) => a.status === "absent").length;
    const late = attendance.filter((a) => a.status === "late").length;
    const total = attendance.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, late, total, percentage };
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
        return "bg-green-500";
      case "absent":
        return "bg-red-500";
      case "late":
        return "bg-yellow-500";
      case "half_day":
        return "bg-orange-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-green-700";
      case "absent":
        return "text-red-700";
      case "late":
        return "text-yellow-700";
      case "half_day":
        return "text-orange-700";
      default:
        return "text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return "✓";
      case "absent":
        return "✗";
      case "late":
        return "⏰";
      case "half_day":
        return "⊖";
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

    attendance.forEach((record) => {
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
    <SafeAreaView className="bg-background flex-1">
      {studentInfo && (
        <View className="flex-1">
          <Appbar title="Student Details" />

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Hero Section */}
            <View className="bg-gradient-to-b from-primary/10 to-transparent pt-6 pb-8 px-6">
              <View className="bg-white rounded-2xl p-4 border border-border flex flex-col gap-4">
                <View className="flex-row items-center">
                  <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mr-4 shadow-sm">
                    <Text className="text-white text-2xl font-bold">
                      {studentInfo.firstName.charAt(0)}
                      {studentInfo.lastName.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900 mb-1">
                      {studentInfo.firstName} {studentInfo.lastName}
                    </Text>
                    <Text className="text-gray-500 text-sm mb-2">
                      Student ID: {studentInfo.studentId}
                    </Text>
                    <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full self-start">
                      <School
                        size={16}
                        color="#2563eb"
                        className="mr-2"
                      />
                      <Text className="text-blue-700 text-sm font-medium">
                        {studentInfo.class?.name || "Class not assigned"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Personal Information */}
            <View className="px-6 mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Personal Information
              </Text>
              <View className="bg-white rounded-2xl p-4 border border-border flex flex-col gap-4">
                <View className="flex-row items-center p-3 bg-gray-50 rounded-xl">
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Mail size={20} color="#2563eb" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 font-medium">
                      Email
                    </Text>
                    <Text className="text-gray-900">{studentInfo.email}</Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 bg-gray-50 rounded-xl">
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Phone size={20} color="#16a34a" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 font-medium">
                      Phone
                    </Text>
                    <Text className="text-gray-900">{studentInfo.phone}</Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 bg-gray-50 rounded-xl">
                  <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                    <MapPin size={20} color="#8b5cf6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 font-medium">
                      Address
                    </Text>
                    <Text className="text-gray-900">{studentInfo.address}</Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 bg-gray-50 rounded-xl">
                  <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                    <Calendar size={20} color="#f59e0b" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 font-medium">
                      Date of Birth
                    </Text>
                    <Text className="text-gray-900">
                      {formatDate(studentInfo.dateOfBirth)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 bg-gray-50 rounded-xl">
                  <View className="w-10 h-10 bg-pink-100 rounded-full items-center justify-center mr-3">
                    <User size={20} color="#ec4899" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 font-medium">
                      Gender
                    </Text>
                    <Text className="text-gray-900 capitalize">
                      {studentInfo.gender}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Attendance Statistics */}
            <View className="px-6 mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Attendance Overview
              </Text>
              <View className="bg-white rounded-2xl p-4 gap-4 border border-border">
                <View className="flex flex-row gap-4">
                  <View className="bg-green-50 flex-1 p-3 rounded-xl border border-green-200">
                    <View className="flex-row items-center justify-between mb-3">
                      <CheckCircle
                        size={24}
                        color="#16a34a"
                      />
                      <Text className="text-2xl font-bold text-green-600">
                        {stats.present}
                      </Text>
                    </View>
                    <Text className="text-green-700 font-medium">Present</Text>
                  </View>

                  <View className="bg-red-50 flex-1 p-3 rounded-xl border border-red-200">
                    <View className="flex-row items-center justify-between mb-3">
                      <XCircle size={24} color="#ef4444" />
                      <Text className="text-2xl font-bold text-red-600">
                        {stats.absent}
                      </Text>
                    </View>
                    <Text className="text-red-700 font-medium">Absent</Text>
                  </View>
                </View>

                <View className="flex flex-row gap-4">
                  <View className="bg-yellow-50 flex-1 p-3 rounded-xl border border-yellow-200">
                    <View className="flex-row items-center justify-between mb-3">
                      <Clock size={24} color="#f59e0b" />
                      <Text className="text-2xl font-bold text-yellow-600">
                        {stats.late}
                      </Text>
                    </View>
                    <Text className="text-yellow-700 font-medium">Late</Text>
                  </View>

                  <View className="bg-blue-50 flex-1 p-3 rounded-xl border border-blue-200">
                    <View className="flex-row items-center justify-between mb-3">
                      <BarChart3 size={24} color="#2563eb" />
                      <Text className="text-2xl font-bold text-blue-600">
                        {stats.total}
                      </Text>
                    </View>
                    <Text className="text-blue-700 font-medium">Total</Text>
                  </View>
                </View>

                <View className="rounded-xl p-3 border border-border">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-lg font-semibold text-gray-900">
                      Attendance Rate
                    </Text>
                    <Text className="text-2xl font-bold text-blue-600">
                      {stats.percentage}%
                    </Text>
                  </View>
                  <View className="w-full bg-white rounded-full h-3">
                    <View
                      className="bg-primary h-3 rounded-full"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </View>
                  <Text className="text-sm text-gray-600 mt-2 text-center">
                    {stats.present} out of {stats.total} days attended
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Attendance */}
            <View className="px-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Attendance Calendar
              </Text>
              <View className="bg-white">
                {isLoadingAttendance ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="large" className="text-primary" />
                    <Text className="text-gray-500 mt-3 font-medium">
                      Loading attendance records...
                    </Text>
                  </View>
                ) : attendance.length > 0 ? (
                  <View className="flex flex-col gap-6">
                    {Object.entries(groupedAttendance)
                      .sort(([a], [b]) => b.localeCompare(a)) // Sort by month (newest first)
                      .slice(0, 3) // Show last 3 months
                      .map(([monthKey, monthAttendance]) => {
                        const firstDate = new Date(monthAttendance[0].date);
                        const monthName = formatMonthYear(
                          monthAttendance[0].date
                        );

                        // Create a map of dates to attendance records
                        const attendanceMap = new Map();
                        monthAttendance.forEach((record) => {
                          attendanceMap.set(record.date, record);
                        });

                        // Get all days in the month
                        const year = firstDate.getFullYear();
                        const month = firstDate.getMonth();
                        const daysInMonth = new Date(
                          year,
                          month + 1,
                          0
                        ).getDate();
                        const firstDayOfMonth = new Date(
                          year,
                          month,
                          1
                        ).getDay();

                        return (
                          <View
                            key={monthKey}
                            className="flex flex-col gap-3 p-3 border rounded-2xl border-border"
                          >
                            <Text className="text-lg font-semibold text-gray-900 mb-3">
                              {monthName}
                            </Text>

                            {/* Calendar Grid */}
                            <View className="flex flex-col gap-2">
                              {/* Day headers */}
                              <View className="flex-row">
                                {[
                                  "Sun",
                                  "Mon",
                                  "Tue",
                                  "Wed",
                                  "Thu",
                                  "Fri",
                                  "Sat",
                                ].map((day) => (
                                  <View
                                    key={day}
                                    className="flex-1 items-center"
                                  >
                                    <Text className="text-xs font-medium text-gray-500">
                                      {day}
                                    </Text>
                                  </View>
                                ))}
                              </View>

                              {/* Calendar days */}
                              <View className="gap-2">
                                {Array.from(
                                  {
                                    length: Math.ceil(
                                      (firstDayOfMonth + daysInMonth) / 7
                                    ),
                                  },
                                  (_, weekIndex) => (
                                    <View
                                      key={weekIndex}
                                      className="flex-row gap-2"
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
                                                className="flex-1 aspect-square"
                                              />
                                            );
                                          }

                                          const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
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
                                              className="flex-1 aspect-square"
                                            >
                                              {attendanceRecord ? (
                                                <View
                                                  className={`flex-1 rounded-lg items-center justify-center border border-border ${
                                                    isToday
                                                      ? "border-blue-500"
                                                      : "border-transparent"
                                                  } ${getStatusColor(attendanceRecord.status)}`}
                                                >
                                                  <Text className="text-white text-xs font-bold">
                                                    {dayNumber}
                                                  </Text>
                                                </View>
                                              ) : (
                                                <View
                                                  className={`flex-1 rounded-lg items-center justify-center border ${
                                                    isToday
                                                      ? "border-blue-500 bg-blue-50"
                                                      : "border-gray-200"
                                                  }`}
                                                >
                                                  <Text
                                                    className={`text-xs ${
                                                      isToday
                                                        ? "text-blue-700 font-bold"
                                                        : "text-gray-400"
                                                    }`}
                                                  >
                                                    {dayNumber}
                                                  </Text>
                                                </View>
                                              )}
                                            </View>
                                          );
                                        }
                                      )}
                                    </View>
                                  )
                                )}
                              </View>
                            </View>

                            {/* Legend */}
                            <View className="flex-row flex-wrap gap-3 pt-3 border-t border-gray-100">
                              <View className="flex-row items-center">
                                <View className="w-4 h-4 bg-green-500 rounded mr-2" />
                                <Text className="text-xs text-gray-600">
                                  Present
                                </Text>
                              </View>
                              <View className="flex-row items-center">
                                <View className="w-4 h-4 bg-red-500 rounded mr-2" />
                                <Text className="text-xs text-gray-600">
                                  Absent
                                </Text>
                              </View>
                              <View className="flex-row items-center">
                                <View className="w-4 h-4 bg-yellow-500 rounded mr-2" />
                                <Text className="text-xs text-gray-600">
                                  Late
                                </Text>
                              </View>
                              <View className="flex-row items-center">
                                <View className="w-4 h-4 bg-orange-500 rounded mr-2" />
                                <Text className="text-xs text-gray-600">
                                  Half Day
                                </Text>
                              </View>
                              <View className="flex-row items-center">
                                <View className="w-4 h-4 border-2 border-blue-500 bg-blue-50 rounded mr-2" />
                                <Text className="text-xs text-gray-600">
                                  Today
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                  </View>
                ) : (
                  <View className="items-center py-8">
                    <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                      <CalendarIcon
                        size={32}
                        className="text-gray-400"
                      />
                    </View>
                    <Text className="text-gray-900 font-semibold mb-2">
                      No attendance records
                    </Text>
                    <Text className="text-gray-500 text-center">
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
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
            <User
              size={40}
              className="text-gray-400"
            />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-3">
            Student not found
          </Text>
          <Text className="text-gray-500 text-center text-lg leading-6">
            The student you're looking for doesn't exist or has been removed
            from the system.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default StudentScreen;
