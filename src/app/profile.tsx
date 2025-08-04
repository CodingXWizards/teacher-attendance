import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  User,
  Eye,
  Clock,
  EyeOff,
  LogOut,
  Settings,
} from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { UserRole } from "@/types/user";
import { AuthService } from "@/services";
import { useNavigation } from "@/navigation";
import { Appbar } from "@/components/appbar";
import { useUserStore } from "@/stores/userStore";
import { useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useConnectivity } from "@/hooks/useConnectivity";
import { SyncStatus } from "@/components/profile/sync-status";

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
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user, setUser } = useUserStore();
  const { isOnline } = useConnectivity();

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

  // Load sync stats and frequency on component mount

  if (!user) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
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
        return colors.primary;
      case UserRole.ADMIN:
        return colors.secondary;
      default:
        return colors.textSecondary;
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
      showAlert({
        title: "Error",
        message: "Please fill in all fields",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement profile update API call
      // const updatedUser = await AuthService.updateProfile(profileForm);
      // setUser(updatedUser);

      showAlert({
        title: "Success",
        message: "Profile updated successfully",
        type: "success",
      });
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      showAlert({
        title: "Error",
        message: errorMessage,
        type: "error",
      });
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
      showAlert({
        title: "Error",
        message: "Please fill in all password fields",
        type: "error",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert({
        title: "Error",
        message: "New passwords do not match",
        type: "error",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showAlert({
        title: "Error",
        message: "Password must be at least 6 characters long",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement password change API call
      // await AuthService.changePassword(passwordForm);

      showAlert({
        title: "Success",
        message: "Password changed successfully",
        type: "success",
      });
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to change password";
      showAlert({
        title: "Error",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    showAlert({
      title: "Logout",
      message: "Are you sure you want to logout?",
      type: "warning",
      buttons: [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
              await AuthService.logout();
              setUser(null);
            } catch (error) {
              console.error("Logout error:", error);
              // Force logout even if API call fails
              setUser(null);
              navigation.navigate("Login" as never);
            }
          },
        },
      ],
    });
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <Appbar
          title="Profile"
          subtitle="Manage your account"
          trailing={
            <TouchableOpacity
              style={[
                styles.settingsButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() =>
                showAlert({
                  title: "Settings",
                  message: "Settings not implemented yet",
                  type: "info",
                })
              }
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
          }
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View
            style={[
              styles.profileHeader,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                borderWidth: 1,
              },
            ]}
          >
            <View
              style={[
                styles.profileAvatar,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[styles.profileInitials, { color: colors.onPrimary }]}
              >
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </Text>
            </View>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user.firstName} {user.lastName}
            </Text>
            <Text
              style={[styles.profileEmail, { color: colors.textSecondary }]}
            >
              {user.email}
            </Text>
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Personal Information
              </Text>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.primary }]}
                onPress={() => setIsEditing(!isEditing)}
              >
                <Text
                  style={[styles.editButtonText, { color: colors.onPrimary }]}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.formCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.formField}>
                <Text
                  style={[styles.fieldLabel, { color: colors.textSecondary }]}
                >
                  First Name
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: colors.border,
                      color: colors.text,
                      backgroundColor: colors.surfaceElevated,
                    },
                  ]}
                  value={profileForm.firstName}
                  onChangeText={text =>
                    setProfileForm({ ...profileForm, firstName: text })
                  }
                  editable={isEditing}
                  placeholder="Enter first name"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.formField}>
                <Text
                  style={[styles.fieldLabel, { color: colors.textSecondary }]}
                >
                  Last Name
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: colors.border,
                      color: colors.text,
                      backgroundColor: colors.surfaceElevated,
                    },
                  ]}
                  value={profileForm.lastName}
                  onChangeText={text =>
                    setProfileForm({ ...profileForm, lastName: text })
                  }
                  editable={isEditing}
                  placeholder="Enter last name"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.formField}>
                <Text
                  style={[styles.fieldLabel, { color: colors.textSecondary }]}
                >
                  Email
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: colors.border,
                      color: colors.text,
                      backgroundColor: colors.surfaceElevated,
                    },
                  ]}
                  value={profileForm.email}
                  onChangeText={text =>
                    setProfileForm({ ...profileForm, email: text })
                  }
                  editable={isEditing}
                  placeholder="Enter email"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {isEditing && (
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleUpdateProfile}
                  disabled={isLoading}
                >
                  <Text
                    style={[styles.saveButtonText, { color: colors.onPrimary }]}
                  >
                    Save Changes
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Change Password */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Security
              </Text>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.primary }]}
                onPress={() => setIsChangingPassword(!isChangingPassword)}
              >
                <Text
                  style={[styles.editButtonText, { color: colors.onPrimary }]}
                >
                  {isChangingPassword ? "Cancel" : "Change"}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.formCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.formField}>
                <Text
                  style={[styles.fieldLabel, { color: colors.textSecondary }]}
                >
                  Current Password
                </Text>
                <View
                  style={[
                    styles.passwordInputContainer,
                    { borderColor: colors.border },
                  ]}
                >
                  <TextInput
                    style={[styles.passwordInput, { color: colors.text }]}
                    value={passwordForm.currentPassword}
                    onChangeText={text =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: text,
                      })
                    }
                    secureTextEntry={!showCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={colors.textTertiary}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formField}>
                <Text
                  style={[styles.fieldLabel, { color: colors.textSecondary }]}
                >
                  New Password
                </Text>
                <View
                  style={[
                    styles.passwordInputContainer,
                    { borderColor: colors.border },
                  ]}
                >
                  <TextInput
                    style={[styles.passwordInput, { color: colors.text }]}
                    value={passwordForm.newPassword}
                    onChangeText={text =>
                      setPasswordForm({ ...passwordForm, newPassword: text })
                    }
                    secureTextEntry={!showNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.textTertiary}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formField}>
                <Text
                  style={[styles.fieldLabel, { color: colors.textSecondary }]}
                >
                  Confirm New Password
                </Text>
                <View
                  style={[
                    styles.passwordInputContainer,
                    { borderColor: colors.border },
                  ]}
                >
                  <TextInput
                    style={[styles.passwordInput, { color: colors.text }]}
                    value={passwordForm.confirmPassword}
                    onChangeText={text =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: text,
                      })
                    }
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.textTertiary}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {isChangingPassword && (
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleChangePassword}
                  disabled={isLoading}
                >
                  <Text
                    style={[styles.saveButtonText, { color: colors.onPrimary }]}
                  >
                    Change Password
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Data Sync Section */}
          <SyncStatus />

          {/* Sync Logs Section */}
          <View>
            <Text
              style={[
                styles.sectionTitle,
                { marginBottom: 8, color: colors.text },
              ]}
            >
              Sync History
            </Text>
            <View
              style={[
                styles.syncLogsCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <TouchableOpacity
                style={styles.syncLogsButton}
                onPress={() => navigation.navigate("SyncLogs")}
              >
                <Clock size={20} color={colors.primary} />
                <Text style={[styles.syncLogsText, { color: colors.primary }]}>
                  View Sync Logs
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Section */}
          <View>
            <Text
              style={[
                styles.sectionTitle,
                { marginBottom: 8, color: colors.text },
              ]}
            >
              Account Actions
            </Text>
            <View
              style={[
                styles.logoutCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <LogOut size={20} color={colors.error} />
                <Text style={[styles.logoutText, { color: colors.error }]}>
                  Logout
                </Text>
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
  },
  safeArea: {
    flex: 1,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
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
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  profileEmail: {
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  formCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontWeight: "500",
  },
  logoutCard: {
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  logoutText: {
    fontWeight: "500",
  },
  syncLogsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  syncLogsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  syncLogsText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
