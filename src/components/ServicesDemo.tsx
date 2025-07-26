import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { 
  AuthService, 
  TeachersService, 
  AttendanceService, 
  ReportsService,
  type Teacher,
  type TeacherAttendance
} from '@/services';

const ServicesDemo = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<TeacherAttendance[]>([]);
  const [loading, setLoading] = useState(false);

  // Example: Get all teachers
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const result = await TeachersService.getTeachers({ limit: 10 });
      setTeachers(result.teachers);
      Alert.alert('Success', `Fetched ${result.teachers.length} teachers`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  // Example: Create a new teacher
  const createTeacher = async () => {
    try {
      const newTeacher = await TeachersService.createTeacher({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@school.com',
        subject: 'Mathematics',
        phone: '+1234567890'
      });
      Alert.alert('Success', `Created teacher: ${newTeacher.firstName} ${newTeacher.lastName}`);
      fetchTeachers(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create teacher');
    }
  };

  // Example: Mark teacher attendance
  const markAttendance = async () => {
    if (teachers.length === 0) {
      Alert.alert('Error', 'No teachers available. Please fetch teachers first.');
      return;
    }

    try {
      const teacher = teachers[0];
      const today = new Date().toISOString().split('T')[0];
      
      const attendanceRecord = await AttendanceService.markTeacherPresent(
        teacher.id,
        today,
        new Date().toTimeString().split(' ')[0]
      );
      
      Alert.alert('Success', `Marked ${teacher.firstName} as present`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to mark attendance');
    }
  };

  // Example: Get attendance by date
  const fetchAttendanceByDate = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const attendanceData = await AttendanceService.getAttendanceByDate(today);
      setAttendance(attendanceData);
      Alert.alert('Success', `Fetched ${attendanceData.length} attendance records for today`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to fetch attendance');
    }
  };

  // Example: Get attendance summary
  const getAttendanceSummary = async () => {
    try {
      const summary = await ReportsService.getAttendanceSummary();
      Alert.alert('Summary', 
        `Total: ${summary.totalTeachers}\n` +
        `Present: ${summary.presentTeachers}\n` +
        `Absent: ${summary.absentTeachers}\n` +
        `Present %: ${summary.presentPercentage.toFixed(1)}%`
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to get summary');
    }
  };

  // Example: Check authentication status
  const checkAuthStatus = async () => {
    try {
      const isAuthenticated = await AuthService.isAuthenticated();
      const user = await AuthService.getStoredUser();
      
      if (isAuthenticated && user) {
        Alert.alert('Auth Status', `Authenticated as: ${user.firstName} ${user.lastName}`);
      } else {
        Alert.alert('Auth Status', 'Not authenticated');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to check auth status');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Services Demo
      </Text>

      <View className="space-y-4">
        {/* Auth Service Examples */}
        <View className="bg-white p-4 rounded-lg shadow">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Authentication</Text>
          <TouchableOpacity
            onPress={checkAuthStatus}
            className="bg-blue-500 p-3 rounded-lg mb-2"
          >
            <Text className="text-white text-center font-medium">Check Auth Status</Text>
          </TouchableOpacity>
        </View>

        {/* Teachers Service Examples */}
        <View className="bg-white p-4 rounded-lg shadow">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Teachers</Text>
          <TouchableOpacity
            onPress={fetchTeachers}
            disabled={loading}
            className="bg-green-500 p-3 rounded-lg mb-2"
          >
            <Text className="text-white text-center font-medium">
              {loading ? 'Loading...' : 'Fetch Teachers'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={createTeacher}
            className="bg-green-600 p-3 rounded-lg mb-2"
          >
            <Text className="text-white text-center font-medium">Create Teacher</Text>
          </TouchableOpacity>
        </View>

        {/* Attendance Service Examples */}
        <View className="bg-white p-4 rounded-lg shadow">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Attendance</Text>
          <TouchableOpacity
            onPress={markAttendance}
            className="bg-purple-500 p-3 rounded-lg mb-2"
          >
            <Text className="text-white text-center font-medium">Mark Teacher Present</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={fetchAttendanceByDate}
            className="bg-purple-600 p-3 rounded-lg mb-2"
          >
            <Text className="text-white text-center font-medium">Get Today's Attendance</Text>
          </TouchableOpacity>
        </View>

        {/* Reports Service Examples */}
        <View className="bg-white p-4 rounded-lg shadow">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Reports</Text>
          <TouchableOpacity
            onPress={getAttendanceSummary}
            className="bg-orange-500 p-3 rounded-lg mb-2"
          >
            <Text className="text-white text-center font-medium">Get Attendance Summary</Text>
          </TouchableOpacity>
        </View>

        {/* Display Results */}
        {teachers.length > 0 && (
          <View className="bg-white p-4 rounded-lg shadow">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Teachers ({teachers.length})</Text>
            {teachers.slice(0, 3).map((teacher, index) => (
              <Text key={index} className="text-gray-600 mb-1">
                {teacher.firstName} {teacher.lastName} - {teacher.subject}
              </Text>
            ))}
            {teachers.length > 3 && (
              <Text className="text-gray-500 text-sm">... and {teachers.length - 3} more</Text>
            )}
          </View>
        )}

        {attendance.length > 0 && (
          <View className="bg-white p-4 rounded-lg shadow">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Today's Attendance ({attendance.length})</Text>
            {attendance.slice(0, 3).map((record, index) => (
              <Text key={index} className="text-gray-600 mb-1">
                {record.teacherName} - {record.isPresent ? 'Present' : 'Absent'}
              </Text>
            ))}
            {attendance.length > 3 && (
              <Text className="text-gray-500 text-sm">... and {attendance.length - 3} more</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ServicesDemo; 