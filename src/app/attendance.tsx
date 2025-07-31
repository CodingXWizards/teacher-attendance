import {
  View,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, CheckCircle, XCircle, Save } from "lucide-react-native";

import { AttendanceService } from "@/services";
import { useUserStore } from "@/stores/userStore";
import { TeacherAttendance, AttendanceStatus } from "@/types";
import { Appbar } from "../components/appbar";

export default function Attendance() {
  const { user } = useUserStore();
  const [attendance, setAttendance] = useState<TeacherAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string>("");
  const [checkOutTime, setCheckOutTime] = useState<string>("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadTodayAttendance();
  }, []);

  const loadTodayAttendance = async () => {
    if (!user) {
      Alert.alert("Error", "No user found. Please log in again.");
      return;
    }

    try {
      setLoading(true);

      // Load today's attendance for the current user
      const todayAttendance = await AttendanceService.getTeacherAttendance(
        user.id,
        { date: today },
      );

      if (todayAttendance.length > 0) {
        setAttendance(todayAttendance[0]);
        setCheckInTime(todayAttendance[0].checkIn || "");
        setCheckOutTime(todayAttendance[0].checkOut || "");
      } else {
        setAttendance(null);
        setCheckInTime("");
        setCheckOutTime("");
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
      Alert.alert("Error", "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const markPresent = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const currentTime = new Date().toISOString();

      if (attendance) {
        // Update existing attendance
        await AttendanceService.updateTeacherAttendance(attendance.id, {
          status: AttendanceStatus.PRESENT,
          checkIn: currentTime,
        });
      } else {
        // Create new attendance
        await AttendanceService.createTeacherAttendance({
          teacherId: user.id,
          date: today,
          status: AttendanceStatus.PRESENT,
          checkIn: currentTime,
        });
      }

      setCheckInTime(currentTime);
      await loadTodayAttendance();
      Alert.alert("Success", "Marked as present!");
    } catch (error) {
      console.error("Error marking present:", error);
      Alert.alert("Error", "Failed to mark attendance");
    } finally {
      setSaving(false);
    }
  };

  const markAbsent = async () => {
    if (!user) return;

    try {
      setSaving(true);

      if (attendance) {
        // Update existing attendance
        await AttendanceService.updateTeacherAttendance(attendance.id, {
          status: AttendanceStatus.ABSENT,
        });
      } else {
        // Create new attendance
        await AttendanceService.createTeacherAttendance({
          teacherId: user.id,
          date: today,
          status: AttendanceStatus.ABSENT,
        });
      }

      await loadTodayAttendance();
      Alert.alert("Success", "Marked as absent!");
    } catch (error) {
      console.error("Error marking absent:", error);
      Alert.alert("Error", "Failed to mark attendance");
    } finally {
      setSaving(false);
    }
  };

  const checkOut = async () => {
    if (!attendance) {
      Alert.alert(
        "Error",
        "No attendance record found. Please check in first.",
      );
      return;
    }

    try {
      setSaving(true);
      const currentTime = new Date().toISOString();

      await AttendanceService.checkOutTeacher(attendance.id, currentTime);
      setCheckOutTime(currentTime);
      await loadTodayAttendance();
      Alert.alert("Success", "Checked out successfully!");
    } catch (error) {
      console.error("Error checking out:", error);
      Alert.alert("Error", "Failed to check out");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "#4CAF50";
      case AttendanceStatus.ABSENT:
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "Present";
      case AttendanceStatus.ABSENT:
        return "Absent";
      default:
        return "Not Marked";
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "Not set";
    return new Date(timeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading attendance...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar title="My Attendance" />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userRole}>{user.role}</Text>
            {user.department && (
              <Text style={styles.userDepartment}>{user.department}</Text>
            )}
          </View>
        )}

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Today's Status</Text>
          <View style={styles.statusContent}>
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: attendance
                      ? getStatusColor(attendance.status)
                      : "#9e9e9e",
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {attendance ? getStatusText(attendance.status) : "Not Marked"}
              </Text>
            </View>
          </View>
        </View>

        {attendance && (
          <View style={styles.timeCard}>
            <Text style={styles.timeTitle}>Time Details</Text>
            <View style={styles.timeRow}>
              <Clock size={20} color="#666" />
              <Text style={styles.timeLabel}>Check In:</Text>
              <Text style={styles.timeValue}>{formatTime(checkInTime)}</Text>
            </View>
            {checkOutTime && (
              <View style={styles.timeRow}>
                <Clock size={20} color="#666" />
                <Text style={styles.timeLabel}>Check Out:</Text>
                <Text style={styles.timeValue}>{formatTime(checkOutTime)}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionsContainer}>
          {!attendance ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.presentButton]}
                onPress={markPresent}
                disabled={saving}
              >
                <CheckCircle size={24} color="white" />
                <Text style={styles.actionButtonText}>
                  {saving ? "Marking..." : "Mark Present"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.absentButton]}
                onPress={markAbsent}
                disabled={saving}
              >
                <XCircle size={24} color="white" />
                <Text style={styles.actionButtonText}>
                  {saving ? "Marking..." : "Mark Absent"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            attendance.status === AttendanceStatus.PRESENT &&
            !checkOutTime && (
              <TouchableOpacity
                style={[styles.actionButton, styles.checkoutButton]}
                onPress={checkOut}
                disabled={saving}
              >
                <Save size={24} color="white" />
                <Text style={styles.actionButtonText}>
                  {saving ? "Checking Out..." : "Check Out"}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {attendance && attendance.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{attendance.notes}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  date: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  userInfo: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: "#666",
    textTransform: "capitalize",
    marginBottom: 2,
  },
  userDepartment: {
    fontSize: 14,
    color: "#888",
  },
  statusCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  statusContent: {
    alignItems: "center",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  timeCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  presentButton: {
    backgroundColor: "#4CAF50",
  },
  absentButton: {
    backgroundColor: "#f44336",
  },
  checkoutButton: {
    backgroundColor: "#2196F3",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  notesCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
