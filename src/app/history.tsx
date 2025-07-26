import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { createDbHelpers } from "@/db";

type HistoryRecord = {
  date: string;
  present: number;
  absent: number;
  total: number;
};

export default function History() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Get the SQLite database instance from context
  const expoDb = useSQLiteContext();
  const db = drizzle(expoDb, { schema });
  const dbHelpers = createDbHelpers(db);

  useEffect(() => {
    // Add a small delay to ensure migration is complete
    const timer = setTimeout(() => {
      loadHistory();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await dbHelpers.getAttendanceHistory(30);
      setHistory(historyData as HistoryRecord[]);
    } catch (error) {
      console.error("Error loading history:", error);
      Alert.alert("Error", "Failed to load attendance history");
    } finally {
      setLoading(false);
    }
  };

  const renderHistoryItem = ({ item }: { item: HistoryRecord }) => (
    <View style={styles.historyCard}>
      <View style={styles.dateContainer}>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={styles.day}>
          {new Date(item.date).toLocaleDateString("en-US", { weekday: "long" })}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{item.present}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{item.absent}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{item.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.percentageContainer}>
        <Text style={styles.percentage}>
          {item.total > 0 ? Math.round((item.present / item.total) * 100) : 0}%
          Attendance
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance History</Text>
        <Text style={styles.subtitle}>Past attendance records</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No attendance records found</Text>
          <Text style={styles.emptySubtext}>
            Take attendance first to see history
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.date}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
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
  subtitle: {
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
  historyCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateContainer: {
    marginBottom: 12,
  },
  date: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  day: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2196F3",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  percentageContainer: {
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  percentage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
});
