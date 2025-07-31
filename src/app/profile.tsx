import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from "react-native";
import {
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  School,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUserStore } from "@/stores/userStore";
import { Appbar } from "@/components/appbar";
import { UserRole } from "@/types/user";
import { AuthService } from "@/services";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const navigation = useNavigation();
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.TEACHER:
        return "Teacher";
      case UserRole.ADMIN:
        return "Administrator";
      default:
        return "Unknown";
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.TEACHER:
        return "#3b82f6";
      case UserRole.ADMIN:
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.TEACHER:
        return User;
      case UserRole.ADMIN:
        return Settings;
      default:
        return User;
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.firstName || !profileForm.lastName || !profileForm.email) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement profile update API call
      // const updatedUser = await AuthService.updateProfile(profileForm);
      // setUser(updatedUser);

      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement password change API call
      // await AuthService.changePassword(passwordForm);

      Alert.alert("Success", "Password changed successfully");
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to change password";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AuthService.logout();
            setUser(null);
            navigation.navigate("Login" as never);
          } catch (error) {
            console.error("Logout error:", error);
            // Force logout even if API call fails
            setUser(null);
            navigation.navigate("Login" as never);
          }
        },
      },
    ]);
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Appbar
          title="Profile"
          subtitle="Manage your account"
          trailing={
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() =>
                Alert.alert("Settings", "Settings not implemented yet")
              }
            >
              <Settings size={24} color="#1f2937" />
            </TouchableOpacity>
          }
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </Text>
            </View>
            <Text style={styles.profileName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <View style={styles.roleContainer}>
              <RoleIcon size={16} color={getRoleColor(user.role)} />
              <Text
                style={[styles.roleText, { color: getRoleColor(user.role) }]}
              >
                {getRoleDisplayName(user.role)}
              </Text>
            </View>
          </View>

          {/* Profile Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(!isEditing)}
              >
                <Text style={styles.editButtonText}>
                  {isEditing ? "Cancel" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formCard}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>First Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileForm.firstName}
                  onChangeText={text =>
                    setProfileForm({ ...profileForm, firstName: text })
                  }
                  editable={isEditing}
                  placeholder="Enter first name"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Last Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileForm.lastName}
                  onChangeText={text =>
                    setProfileForm({ ...profileForm, lastName: text })
                  }
                  editable={isEditing}
                  placeholder="Enter last name"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileForm.email}
                  onChangeText={text =>
                    setProfileForm({ ...profileForm, email: text })
                  }
                  editable={isEditing}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {isEditing && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleUpdateProfile}
                  disabled={isLoading}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Change Password */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Security</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsChangingPassword(!isChangingPassword)}
              >
                <Text style={styles.editButtonText}>
                  {isChangingPassword ? "Cancel" : "Change"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formCard}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordForm.currentPassword}
                    onChangeText={text =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: text,
                      })
                    }
                    secureTextEntry={!showCurrentPassword}
                    placeholder="Enter current password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordForm.newPassword}
                    onChangeText={text =>
                      setPasswordForm({ ...passwordForm, newPassword: text })
                    }
                    secureTextEntry={!showNewPassword}
                    placeholder="Enter new password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Confirm New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordForm.confirmPassword}
                    onChangeText={text =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: text,
                      })
                    }
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Confirm new password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {isChangingPassword && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleChangePassword}
                  disabled={isLoading}
                >
                  <Text style={styles.saveButtonText}>Change Password</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Logout Section */}
          <View>
            <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>
              Account Actions
            </Text>
            <View style={styles.logoutCard}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <LogOut size={20} color="#ef4444" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  profileAvatar: {
    width: 80,
    height: 80,
    backgroundColor: "#8b5cf6",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileInitials: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  profileEmail: {
    color: "#6b7280",
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8b5cf610",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  formCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#1f2937",
    fontSize: 16,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 8,
    color: "#1f2937",
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: "#8b5cf6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  logoutCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  logoutText: {
    color: "#ef4444",
    fontWeight: "500",
  },
});
