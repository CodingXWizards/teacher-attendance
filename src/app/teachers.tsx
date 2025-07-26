import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { createDbHelpers } from "@/db";

type Teacher = {
  id: number;
  name: string;
  subject: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
};

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    subject: "",
    email: "",
    phone: "",
  });

  // Get the SQLite database instance from context
  const expoDb = useSQLiteContext();
  const db = drizzle(expoDb, { schema });
  const dbHelpers = createDbHelpers(db);

  useEffect(() => {
    // Add a small delay to ensure migration is complete
    const timer = setTimeout(() => {
      loadTeachers();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const allTeachers = await dbHelpers.getAllTeachers();
      setTeachers(allTeachers);
    } catch (error) {
      console.error("Error loading teachers:", error);
      Alert.alert("Error", "Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const addTeacher = async () => {
    if (!newTeacher.name.trim() || !newTeacher.subject.trim()) {
      Alert.alert("Error", "Name and subject are required");
      return;
    }

    try {
      await dbHelpers.addTeacher({
        name: newTeacher.name.trim(),
        subject: newTeacher.subject.trim(),
        email: newTeacher.email.trim() || undefined,
        phone: newTeacher.phone.trim() || undefined,
      });

      setNewTeacher({ name: "", subject: "", email: "", phone: "" });
      setShowAddModal(false);
      await loadTeachers();
      Alert.alert("Success", "Teacher added successfully");
    } catch (error) {
      console.error("Error adding teacher:", error);
      Alert.alert("Error", "Failed to add teacher");
    }
  };

  const deleteTeacher = async (id: number) => {
    Alert.alert(
      "Delete Teacher",
      "Are you sure you want to delete this teacher?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dbHelpers.deleteTeacher(id);
              await loadTeachers(); // Reload the list
              Alert.alert("Success", "Teacher deleted successfully");
            } catch (error) {
              console.error("Error deleting teacher:", error);
              Alert.alert("Error", "Failed to delete teacher");
            }
          },
        },
      ]
    );
  };

  const renderTeacher = ({ item }: { item: Teacher }) => (
    <View style={styles.teacherCard}>
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.name}</Text>
        <Text style={styles.teacherSubject}>{item.subject}</Text>
        {item.email && <Text style={styles.teacherEmail}>{item.email}</Text>}
        {item.phone && <Text style={styles.teacherPhone}>{item.phone}</Text>}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTeacher(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
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
      <View style={styles.header}>
        <Text style={styles.title}>Manage Teachers</Text>
        <Text style={styles.subtitle}>
          {teachers.length} teachers registered
        </Text>
      </View>

      {teachers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No teachers found</Text>
          <Text style={styles.emptySubtext}>Add teachers to get started</Text>
        </View>
      ) : (
        <FlatList
          data={teachers}
          renderItem={renderTeacher}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+ Add New Teacher</Text>
      </TouchableOpacity>

      {/* Add Teacher Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Teacher</Text>

            <TextInput
              style={styles.input}
              placeholder="Teacher Name"
              value={newTeacher.name}
              onChangeText={(text) =>
                setNewTeacher((prev) => ({ ...prev, name: text }))
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Subject"
              value={newTeacher.subject}
              onChangeText={(text) =>
                setNewTeacher((prev) => ({ ...prev, subject: text }))
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              value={newTeacher.email}
              onChangeText={(text) =>
                setNewTeacher((prev) => ({ ...prev, email: text }))
              }
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Phone (optional)"
              value={newTeacher.phone}
              onChangeText={(text) =>
                setNewTeacher((prev) => ({ ...prev, phone: text }))
              }
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={addTeacher}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  teacherCard: {
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
  teacherInfo: {
    marginBottom: 12,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  teacherSubject: {
    fontSize: 14,
    color: "#2196F3",
    marginTop: 2,
  },
  teacherEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  teacherPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  editButtonText: {
    color: "white",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
