import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Reports() {
  const generateReport = (type: string) => {
    // TODO: Implement report generation logic
    console.log(`Generating ${type} report`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Generate attendance reports</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Daily Reports</Text>

          <TouchableOpacity
            style={styles.reportCard}
            onPress={() => generateReport("daily")}
          >
            <Text style={styles.reportTitle}>Today's Attendance</Text>
            <Text style={styles.reportDescription}>
              View attendance for today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportCard}
            onPress={() => generateReport("yesterday")}
          >
            <Text style={styles.reportTitle}>Yesterday's Attendance</Text>
            <Text style={styles.reportDescription}>
              View attendance for yesterday
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Weekly Reports</Text>

          <TouchableOpacity
            style={styles.reportCard}
            onPress={() => generateReport("weekly")}
          >
            <Text style={styles.reportTitle}>This Week's Summary</Text>
            <Text style={styles.reportDescription}>
              Weekly attendance overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportCard}
            onPress={() => generateReport("lastWeek")}
          >
            <Text style={styles.reportTitle}>Last Week's Summary</Text>
            <Text style={styles.reportDescription}>
              Previous week attendance
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Monthly Reports</Text>

          <TouchableOpacity
            style={styles.reportCard}
            onPress={() => generateReport("monthly")}
          >
            <Text style={styles.reportTitle}>This Month's Summary</Text>
            <Text style={styles.reportDescription}>
              Monthly attendance overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportCard}
            onPress={() => generateReport("lastMonth")}
          >
            <Text style={styles.reportTitle}>Last Month's Summary</Text>
            <Text style={styles.reportDescription}>
              Previous month attendance
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Custom Reports</Text>

          <TouchableOpacity
            style={styles.reportCard}
            onPress={() => generateReport("custom")}
          >
            <Text style={styles.reportTitle}>Custom Date Range</Text>
            <Text style={styles.reportDescription}>
              Generate report for specific dates
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportCard}
            onPress={() => generateReport("teacher")}
          >
            <Text style={styles.reportTitle}>Individual Teacher Report</Text>
            <Text style={styles.reportDescription}>
              Attendance report for specific teacher
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  reportSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  reportCard: {
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
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: "#666",
  },
});
