import {
  View,
  Text,
  Alert,
  Modal,
  FlatList,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApi } from "@/hooks/useApi";
import { TeachersService } from "@/services";
import {
  Plus,
  Trash2,
  User,
  Users,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react-native";
import { Teacher, CreateTeacherRequest } from "@/types";

export default function Teachers() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState<CreateTeacherRequest>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    employeeId: "",
    department: "",
    phone: "",
    address: "",
    hireDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    isActive: true,
  });

  const {
    data: teachersResponse,
    loading,
    error,
    refreshing,
    refresh,
  } = useApi(() => TeachersService.getTeachers(), {
    onError: error => {
      Alert.alert("Error", error);
    },
  });

  const teachers = teachersResponse?.data || [];

  const addTeacher = async () => {
    if (
      !newTeacher.email.trim() ||
      !newTeacher.password.trim() ||
      !newTeacher.firstName.trim() ||
      !newTeacher.lastName.trim() ||
      !newTeacher.employeeId.trim() ||
      !newTeacher.department.trim()
    ) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      await TeachersService.createTeacher(newTeacher);
      setNewTeacher({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        employeeId: "",
        department: "",
        phone: "",
        address: "",
        hireDate: new Date().toISOString().split("T")[0],
        isActive: true,
      });
      setShowAddModal(false);
      await refresh();
      Alert.alert("Success", "Teacher added successfully");
    } catch (error) {
      console.error("Error adding teacher:", error);
      Alert.alert("Error", "Failed to add teacher");
    }
  };

  const deleteTeacher = async (id: string) => {
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
              await TeachersService.deleteTeacher(id);
              await refresh();
              Alert.alert("Success", "Teacher deleted successfully");
            } catch (error) {
              console.error("Error deleting teacher:", error);
              Alert.alert("Error", "Failed to delete teacher");
            }
          },
        },
      ],
    );
  };

  const renderTeacher = ({ item }: { item: Teacher }) => (
    <View style={styles.teacherCard}>
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.employeeId}>Employee ID: {item.employeeId}</Text>
        <Text style={styles.teacherDetail}>Department: {item.department}</Text>
        {item.phone && (
          <Text style={styles.teacherDetail}>Phone: {item.phone}</Text>
        )}
        {item.email && (
          <Text style={styles.teacherDetail}>Email: {item.email}</Text>
        )}
        <Text style={styles.hireDate}>
          Hired: {new Date(item.hireDate).toLocaleDateString()}
        </Text>
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading teachers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <AlertCircle size={32} color="#ef4444" />
        </View>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Teachers</Text>
          <Text style={styles.subtitle}>
            {teachers.length} teachers registered
          </Text>
        </View>

        {teachers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Users size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>No teachers found</Text>
            <Text style={styles.emptyText}>Add teachers to get started</Text>
          </View>
        ) : (
          <FlatList
            data={teachers}
            renderItem={renderTeacher}
            keyExtractor={item => item.id}
            style={styles.teacherList}
            contentContainerStyle={styles.teacherListContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refresh} />
            }
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
                style={styles.modalInput}
                placeholder="Email"
                placeholderTextColor="#6b7280"
                value={newTeacher.email}
                onChangeText={text =>
                  setNewTeacher(prev => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Password"
                placeholderTextColor="#6b7280"
                value={newTeacher.password}
                onChangeText={text =>
                  setNewTeacher(prev => ({ ...prev, password: text }))
                }
                secureTextEntry
              />

              <TextInput
                style={styles.modalInput}
                placeholder="First Name"
                placeholderTextColor="#6b7280"
                value={newTeacher.firstName}
                onChangeText={text =>
                  setNewTeacher(prev => ({ ...prev, firstName: text }))
                }
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Last Name"
                placeholderTextColor="#6b7280"
                value={newTeacher.lastName}
                onChangeText={text =>
                  setNewTeacher(prev => ({ ...prev, lastName: text }))
                }
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Employee ID"
                placeholderTextColor="#6b7280"
                value={newTeacher.employeeId}
                onChangeText={text =>
                  setNewTeacher(prev => ({ ...prev, employeeId: text }))
                }
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Department"
                placeholderTextColor="#6b7280"
                value={newTeacher.department}
                onChangeText={text =>
                  setNewTeacher(prev => ({ ...prev, department: text }))
                }
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Phone"
                placeholderTextColor="#6b7280"
                value={newTeacher.phone}
                onChangeText={text =>
                  setNewTeacher(prev => ({ ...prev, phone: text }))
                }
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Address"
                placeholderTextColor="#6b7280"
                value={newTeacher.address}
                onChangeText={text =>
                  setNewTeacher(prev => ({ ...prev, address: text }))
                }
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Hire Date (YYYY-MM-DD)"
                placeholderTextColor="#6b7280"
                value={newTeacher.hireDate}
                onChangeText={text =>
                  setNewTeacher(prev => ({ ...prev, hireDate: text }))
                }
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={addTeacher}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#6b7280",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#fef2f2",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorTitle: {
    color: "#1f2937",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: "#1f2937",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
  },
  teacherList: {
    flex: 1,
  },
  teacherListContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  teacherCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  teacherInfo: {
    marginBottom: 12,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  employeeId: {
    fontSize: 14,
    color: "#8b5cf6",
    marginBottom: 4,
  },
  teacherDetail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  hireDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#f59e0b",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 14,
  },
  addButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#ffffff",
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
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 24,
    width: "92%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 24,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: "#1f2937",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#8b5cf6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
