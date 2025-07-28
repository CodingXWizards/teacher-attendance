import {
  View,
  Text,
  Modal,
  Alert,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { User, UserRole } from "@/types";
import AuthService from "@/services/auth";
import UsersService from "@/services/users";
import { Appbar } from "@/components/appbar";
import { useUserStore } from "@/stores/userStore";

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
  const { setUser: setUserStore } = useUserStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await UsersService.getProfile();
        setUser(userData);
        setProfileForm({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load profile";
        setError(errorMessage);
        Alert.alert("Error", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Administrator";
      case UserRole.PRINCIPAL:
        return "Principal";
      case UserRole.TEACHER:
        return "Teacher";
      default:
        return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "#ef4444"; // Red
      case UserRole.PRINCIPAL:
        return "#8b5cf6"; // Purple
      case UserRole.TEACHER:
        return "#10b981"; // Green
      default:
        return "#94a3b8"; // Gray
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "shield";
      case UserRole.PRINCIPAL:
        return "school";
      case UserRole.TEACHER:
        return "person";
      default:
        return "help-circle";
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const updatedUser = await UsersService.updateUser(user.id, {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
      });

      setUser(updatedUser);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      await UsersService.changePassword(user.id, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      Alert.alert("Success", "Password changed successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to change password";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
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
            setUserStore(null);
            router.replace("/login");
          } catch (error) {
            console.error("Logout error:", error);
            // Still clear local state even if API call fails
            setUserStore(null);
            router.replace("/login");
          }
        },
      },
    ]);
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-lg text-foreground mt-4">Loading profile...</Text>
      </View>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-5">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="text-lg text-foreground mt-4 text-center">
          {error || "Failed to load profile"}
        </Text>
        <TouchableOpacity
          className="mt-4 px-6 py-3 bg-primary rounded-xl"
          onPress={() => window.location.reload()}
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        <Appbar
          title="Profile"
          subtitle="Manage your account"
          trailing={
            <TouchableOpacity
              className="size-10 rounded-full bg-card border border-border justify-center items-center"
              onPress={() => setIsEditing(!isEditing)}
            >
              <Ionicons
                name={isEditing ? "close" : "create"}
                size={20}
                className="text-foreground"
              />
            </TouchableOpacity>
          }
        />

        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-card border border-border justify-center items-center mb-4">
              <Ionicons
                name={getRoleIcon(user.role)}
                size={48}
                color={getRoleColor(user.role)}
              />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-1">
              {user.firstName} {user.lastName}
            </Text>
            <View className="flex-row items-center gap-2">
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: getRoleColor(user.role) + "20" }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: getRoleColor(user.role) }}
                >
                  {getRoleDisplayName(user.role)}
                </Text>
              </View>
            </View>
          </View>

          {/* Profile Information */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">
              Personal Information
            </Text>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-muted-foreground mb-2">
                  First Name
                </Text>
                {isEditing ? (
                  <TextInput
                    className="p-3 rounded-xl bg-card border border-border text-foreground"
                    value={profileForm.firstName}
                    onChangeText={(text) =>
                      setProfileForm((prev) => ({ ...prev, firstName: text }))
                    }
                    placeholder="Enter first name"
                    placeholderTextColor="#94a3b8"
                  />
                ) : (
                  <Text className="text-base text-foreground">
                    {user.firstName}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-muted-foreground mb-2">
                  Last Name
                </Text>
                {isEditing ? (
                  <TextInput
                    className="p-3 rounded-xl bg-card border border-border text-foreground"
                    value={profileForm.lastName}
                    onChangeText={(text) =>
                      setProfileForm((prev) => ({ ...prev, lastName: text }))
                    }
                    placeholder="Enter last name"
                    placeholderTextColor="#94a3b8"
                  />
                ) : (
                  <Text className="text-base text-foreground">
                    {user.lastName}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-muted-foreground mb-2">
                  Email
                </Text>
                {isEditing ? (
                  <TextInput
                    className="p-3 rounded-xl bg-card border border-border text-foreground"
                    value={profileForm.email}
                    onChangeText={(text) =>
                      setProfileForm((prev) => ({ ...prev, email: text }))
                    }
                    placeholder="Enter email"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                ) : (
                  <Text className="text-base text-foreground">
                    {user.email}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-muted-foreground mb-2">
                  Role
                </Text>
                <Text className="text-base text-foreground">
                  {getRoleDisplayName(user.role)}
                </Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-muted-foreground mb-2">
                  Member Since
                </Text>
                <Text className="text-base text-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {isEditing && (
              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  className="flex-1 py-3 px-4 rounded-xl bg-card border border-border"
                  onPress={() => {
                    setIsEditing(false);
                    setProfileForm({
                      firstName: user.firstName,
                      lastName: user.lastName,
                      email: user.email,
                    });
                  }}
                >
                  <Text className="text-center font-medium text-foreground">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 px-4 rounded-xl"
                  style={{ backgroundColor: "#8b5cf6" }}
                  onPress={handleUpdateProfile}
                  disabled={isSubmitting}
                >
                  <Text className="text-center font-medium text-white">
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Account Actions */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">
              Account Actions
            </Text>

            <View className="gap-3">
              <TouchableOpacity
                className="flex-row items-center p-4 rounded-xl bg-card border border-border gap-3"
                onPress={() => setIsChangingPassword(true)}
              >
                <View className="w-10 h-10 rounded-full bg-blue-100 justify-center items-center">
                  <Ionicons name="key" size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">
                    Change Password
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Update your account password
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  className="text-muted-foreground"
                />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center p-4 rounded-xl bg-card border border-border gap-3"
                onPress={handleLogout}
              >
                <View className="w-10 h-10 rounded-full bg-red-100 justify-center items-center">
                  <Ionicons name="log-out" size={20} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">
                    Logout
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Sign out of your account
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  className="text-muted-foreground"
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Change Password Modal */}
        <Modal
          visible={isChangingPassword}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View className="flex-1 bg-background">
            <SafeAreaView className="flex-1">
              <Appbar
                title="Change Password"
                subtitle="Update your password"
                trailing={
                  <TouchableOpacity
                    className="size-10 rounded-full bg-card border border-border justify-center items-center"
                    onPress={() => setIsChangingPassword(false)}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      className="text-foreground"
                    />
                  </TouchableOpacity>
                }
              />

              <ScrollView className="flex-1 px-4 py-4">
                <View className="gap-4">
                  <View>
                    <Text className="text-sm font-medium text-muted-foreground mb-2">
                      Current Password
                    </Text>
                    <TextInput
                      className="p-3 rounded-xl bg-card border border-border text-foreground"
                      value={passwordForm.currentPassword}
                      onChangeText={(text) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: text,
                        }))
                      }
                      placeholder="Enter current password"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-muted-foreground mb-2">
                      New Password
                    </Text>
                    <TextInput
                      className="p-3 rounded-xl bg-card border border-border text-foreground"
                      value={passwordForm.newPassword}
                      onChangeText={(text) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: text,
                        }))
                      }
                      placeholder="Enter new password"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-muted-foreground mb-2">
                      Confirm New Password
                    </Text>
                    <TextInput
                      className="p-3 rounded-xl bg-card border border-border text-foreground"
                      value={passwordForm.confirmPassword}
                      onChangeText={(text) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: text,
                        }))
                      }
                      placeholder="Confirm new password"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                    />
                  </View>

                  <View className="flex-row gap-3 mt-6">
                    <TouchableOpacity
                      className="flex-1 py-3 px-4 rounded-xl bg-card border border-border"
                      onPress={() => {
                        setIsChangingPassword(false);
                        setPasswordForm({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                    >
                      <Text className="text-center font-medium text-foreground">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 py-3 px-4 rounded-xl"
                      style={{ backgroundColor: "#8b5cf6" }}
                      onPress={handleChangePassword}
                      disabled={isSubmitting}
                    >
                      <Text className="text-center font-medium text-white">
                        {isSubmitting ? "Updating..." : "Update Password"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
