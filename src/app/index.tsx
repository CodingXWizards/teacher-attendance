// app/index.tsx
import { Link } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Teacher Attendance</Text>
        <Text style={styles.subtitle}>Manage your attendance records</Text>

        <View style={styles.navigationGrid}>
          <Link href="/attendance" asChild>
            <TouchableOpacity style={styles.navCard}>
              <Text style={styles.navTitle}>Take Attendance</Text>
              <Text style={styles.navDescription}>
                Mark attendance for today
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/history" asChild>
            <TouchableOpacity style={styles.navCard}>
              <Text style={styles.navTitle}>Attendance History</Text>
              <Text style={styles.navDescription}>View past records</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/teachers" asChild>
            <TouchableOpacity style={styles.navCard}>
              <Text style={styles.navTitle}>Manage Teachers</Text>
              <Text style={styles.navDescription}>
                Add or edit teacher profiles
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/reports" asChild>
            <TouchableOpacity style={styles.navCard}>
              <Text style={styles.navTitle}>Reports</Text>
              <Text style={styles.navDescription}>
                Generate attendance reports
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#666",
  },
  navigationGrid: {
    flex: 1,
    gap: 16,
  },
  navCard: {
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
  navTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  navDescription: {
    fontSize: 14,
    color: "#666",
  },
});
