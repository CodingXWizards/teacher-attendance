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
  AlertCircle
} from "lucide-react-native";
import { TeacherWithUser, CreateTeacherRequest } from "@/types";

export default function Teachers() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState<CreateTeacherRequest>({
    userId: "",
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
    onError: (error) => {
      Alert.alert("Error", error);
    },
  });

  const teachers = teachersResponse?.data || [];

  const addTeacher = async () => {
    if (!newTeacher.employeeId.trim() || !newTeacher.department.trim()) {
      Alert.alert("Error", "Employee ID and department are required");
      return;
    }

    try {
      await TeachersService.createTeacher(newTeacher);
      setNewTeacher({
        userId: "",
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
      ]
    );
  };

  const renderTeacher = ({ item }: { item: TeacherWithUser }) => (
    <View className="bg-card border border-border rounded-xl p-4 mb-3">
      <View className="mb-3">
        <Text className="text-lg font-semibold text-foreground mb-1">
          {item.user?.firstName} {item.user?.lastName}
        </Text>
        <Text className="text-sm text-primary mb-1">
          Employee ID: {item.employeeId}
        </Text>
        <Text className="text-sm text-muted-foreground mb-1">
          Department: {item.department}
        </Text>
        {item.phone && (
          <Text className="text-sm text-muted-foreground mb-1">
            Phone: {item.phone}
          </Text>
        )}
        {item.user?.email && (
          <Text className="text-sm text-muted-foreground mb-1">
            Email: {item.user.email}
          </Text>
        )}
        <Text className="text-xs text-muted-foreground">
          Hired: {new Date(item.hireDate).toLocaleDateString()}
        </Text>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity className="flex-1 bg-amber-500 py-2 px-3 rounded-lg items-center">
          <Text className="text-white font-medium text-sm">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-red-500 py-2 px-3 rounded-lg items-center"
          onPress={() => deleteTeacher(item.id)}
        >
          <Text className="text-white font-medium text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading teachers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-5">
        <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-4">
          <AlertCircle size={32} color="#ef4444" />
        </View>
        <Text className="text-foreground text-lg font-semibold mt-4 mb-2">
          Something went wrong
        </Text>
        <Text className="text-muted-foreground text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="px-6 py-3 bg-primary rounded-lg"
          onPress={refresh}
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        <View className="px-5 py-4 border-b border-border">
          <Text className="text-2xl font-bold text-foreground">
            Manage Teachers
          </Text>
          <Text className="text-base text-muted-foreground mt-1">
            {teachers.length} teachers registered
          </Text>
        </View>

        {teachers.length === 0 ? (
          <View className="flex-1 justify-center items-center px-5">
            <Users
              size={48}
              className="text-muted-foreground"
            />
            <Text className="text-foreground text-lg font-semibold mt-4 mb-2">
              No teachers found
            </Text>
            <Text className="text-muted-foreground text-center">
              Add teachers to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={teachers}
            renderItem={renderTeacher}
            keyExtractor={(item) => item.id}
            className="flex-1 px-5 pt-4"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refresh} />
            }
          />
        )}

        <TouchableOpacity
          className="mx-5 mb-5 bg-primary py-4 px-6 rounded-xl items-center"
          onPress={() => setShowAddModal(true)}
        >
          <Text className="text-white text-lg font-semibold">
            + Add New Teacher
          </Text>
        </TouchableOpacity>

        {/* Add Teacher Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View className="bg-card border border-border rounded-xl p-6 w-11/12 max-w-md">
              <Text className="text-xl font-bold text-foreground mb-6 text-center">
                Add New Teacher
              </Text>

              <TextInput
                className="border border-border rounded-lg p-3 mb-4 text-foreground"
                placeholder="Employee ID"
                placeholderTextColor="#6b7280"
                value={newTeacher.employeeId}
                onChangeText={(text) =>
                  setNewTeacher((prev) => ({ ...prev, employeeId: text }))
                }
              />

              <TextInput
                className="border border-border rounded-lg p-3 mb-4 text-foreground"
                placeholder="Department"
                placeholderTextColor="#6b7280"
                value={newTeacher.department}
                onChangeText={(text) =>
                  setNewTeacher((prev) => ({ ...prev, department: text }))
                }
              />

              <TextInput
                className="border border-border rounded-lg p-3 mb-4 text-foreground"
                placeholder="Phone"
                placeholderTextColor="#6b7280"
                value={newTeacher.phone}
                onChangeText={(text) =>
                  setNewTeacher((prev) => ({ ...prev, phone: text }))
                }
                keyboardType="phone-pad"
              />

              <TextInput
                className="border border-border rounded-lg p-3 mb-4 text-foreground"
                placeholder="Address"
                placeholderTextColor="#6b7280"
                value={newTeacher.address}
                onChangeText={(text) =>
                  setNewTeacher((prev) => ({ ...prev, address: text }))
                }
                multiline
                numberOfLines={3}
              />

              <TextInput
                className="border border-border rounded-lg p-3 mb-6 text-foreground"
                placeholder="Hire Date (YYYY-MM-DD)"
                placeholderTextColor="#6b7280"
                value={newTeacher.hireDate}
                onChangeText={(text) =>
                  setNewTeacher((prev) => ({ ...prev, hireDate: text }))
                }
              />

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-red-500 py-3 rounded-lg items-center"
                  onPress={() => setShowAddModal(false)}
                >
                  <Text className="text-white font-semibold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-primary py-3 rounded-lg items-center"
                  onPress={addTeacher}
                >
                  <Text className="text-white font-semibold">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
