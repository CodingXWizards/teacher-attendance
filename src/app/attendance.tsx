import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useIsConnected } from 'react-native-offline';
import * as schema from "@/db/schema";
import { createDbHelpers } from "@/db";
import AttendanceService from "@/services/attendance";
import NetworkStatus from "@/components/NetworkStatus";

type Teacher = {
  id: number;
  name: string;
  subject: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
};

type AttendanceRecord = {
  id: number;
  teacherId: number;
  teacherName: string;
  teacherSubject: string;
  date: string;
  isPresent: number;
};

export default function Attendance() {
  const isConnected = useIsConnected();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Get the SQLite database instance from context
  const expoDb = useSQLiteContext();
  const db = drizzle(expoDb, { schema });
  const dbHelpers = createDbHelpers(db);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Add a small delay to ensure migration is complete
    const timer = setTimeout(() => {
      loadTeachersAndAttendance();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isConnected) {
      AttendanceService.syncPendingOperations();
    }
  }, [isConnected]);

  const loadTeachersAndAttendance = async () => {
    try {
      setLoading(true);

      // Load all teachers
      const allTeachers = await dbHelpers.getAllTeachers();
      setTeachers(allTeachers);

      // Load today's attendance
      const todayAttendance = await dbHelpers.getAttendanceByDate(today);
      const attendanceMap: Record<number, boolean> = {};

      todayAttendance.forEach((record: AttendanceRecord) => {
        attendanceMap[record.teacherId] = record.isPresent === 1;
      });

      setAttendance(attendanceMap);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load teachers and attendance data");
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (teacherId: number) => {
    setAttendance((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);

      if (isConnected) {
        // Online: Save directly to database and server
        const attendancePromises = teachers.map((teacher) => {
          const isPresent = attendance[teacher.id] ? 1 : 0;
          return dbHelpers.saveAttendance({
            teacherId: teacher.id,
            date: today,
            isPresent,
          });
        });

        await Promise.all(attendancePromises);
        
        // Try to sync with server if you have an API
        try {
          await AttendanceService.syncPendingOperations();
        } catch (syncError) {
          console.log("Sync failed, but local save successful:", syncError);
        }
        
        Alert.alert("Success", "Attendance saved successfully!");
      } else {
        // Offline: Save to local database and queue for sync
        const attendancePromises = teachers.map(async (teacher) => {
          const isPresent = attendance[teacher.id] ? 1 : 0;
          
          // Save to local database
          await dbHelpers.saveAttendance({
            teacherId: teacher.id,
            date: today,
            isPresent,
          });

          // Queue for sync when online (now using public method)
          await AttendanceService.addToPendingSync({
            type: 'CREATE',
            data: {
              type: 'teacher',
              payload: {
                teacherId: teacher.id,
                date: today,
                status: isPresent ? 'PRESENT' : 'ABSENT',
              },
            },
          });
        });

        await Promise.all(attendancePromises);
        Alert.alert(
          "Saved Offline", 
          "Attendance saved locally. Will sync when internet is available."
        );
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      Alert.alert("Error", "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const renderTeacher = ({ item }: { item: Teacher }) => (
    <View style={styles.teacherCard}>
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.name}</Text>
        <Text style={styles.teacherSubject}>{item.subject}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.attendanceButton,
          attendance[item.id] ? styles.present : styles.absent,
        ]}
        onPress={() => toggleAttendance(item.id)}
      >
        <Text style={styles.attendanceText}>
          {attendance[item.id] ? "Present" : "Absent"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading teachers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Network Status */}
      <NetworkStatus />
      
      <View style={styles.header}>
        <Text style={styles.title}>Take Attendance</Text>
        <Text style={styles.date}>{new Date(today).toLocaleDateString()}</Text>
        {!isConnected && (
          <Text style={styles.offlineNote}>
            📱 Working offline - changes will sync when online
          </Text>
        )}
      </View>

      {teachers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No teachers found</Text>
          <Text style={styles.emptySubtext}>
            Add teachers in the Teachers section first
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={teachers}
            renderItem={renderTeacher}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={saveAttendance}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : isConnected ? "Save Attendance" : "Save Offline"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
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
  offlineNote: {
    fontSize: 14,
    color: "#f59e0b",
    marginTop: 8,
    fontWeight: "500",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  teacherCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  teacherSubject: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  attendanceButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  present: {
    backgroundColor: "#4CAF50",
  },
  absent: {
    backgroundColor: "#f44336",
  },
  attendanceText: {
    color: "white",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#2196F3",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
