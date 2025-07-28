import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { 
  User as UserIcon, 
  Shield, 
  Crown, 
  Settings, 
  LogOut, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { Appbar } from "@/components/appbar";
import { AuthService } from "@/services";
import { User, UserRole } from "@/types";
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
  const navigation = useNavigation();
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user]);

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "teacher":
        return "Teacher";
      case "principal":
        return "Principal";
      default:
        return "User";
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "#ef4444"; // Red
      case "teacher":
        return "#3b82f6"; // Blue
      case "principal":
        return "#8b5cf6"; // Purple
      default:
        return "#6b7280"; // Gray
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return Shield;
      case "teacher":
        return UserIcon;
      case "principal":
        return Crown;
      default:
        return UserIcon;
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Here you would typically call an API to update the profile
      // For now, we'll just simulate the update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state
      const updatedUser: User = {
        ...user,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
      };

      setUser(updatedUser);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
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
      // Here you would typically call an API to change the password
      // For now, we'll just simulate the change
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
      Alert.alert("Success", "Password changed successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
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
              Alert.alert("Error", "Failed to logout");
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const RoleIcon = getRoleIcon(user.role);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        <Appbar
          title="Profile"
          subtitle="Manage your account"
          trailing={
            <TouchableOpacity onPress={() => Alert.alert("Settings", "Settings not implemented yet")}>
              <Settings size={24} className="text-foreground" />
            </TouchableOpacity>
          }
        />
        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View className="bg-card rounded-xl p-6 mb-6 border border-border">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
                <Text className="text-white text-2xl font-bold">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </Text>
              </View>
              <Text className="text-xl font-bold text-foreground mb-2">
                {user.firstName} {user.lastName}
              </Text>
              <Text className="text-muted-foreground mb-3">{user.email}</Text>
              <View className="flex-row items-center bg-primary/10 px-3 py-1 rounded-full">
                <RoleIcon size={16} color={getRoleColor(user.role)} />
                <Text
                  className="text-sm font-medium ml-2"
                  style={{ color: getRoleColor(user.role) }}
                >
                  {getRoleDisplayName(user.role)}
                </Text>
              </View>
            </View>
          </View>

          {/* Profile Information */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-foreground">
                Personal Information
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                className="px-3 py-1 bg-primary rounded-lg"
              >
                <Text className="text-white text-sm font-medium">
                  {isEditing ? "Cancel" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-card rounded-xl p-4 border border-border">
              <View className="mb-4">
                <Text className="text-sm font-medium text-muted-foreground mb-2">
                  First Name
                </Text>
                {isEditing ? (
                  <TextInput
                    className="border border-border rounded-lg px-3 py-2 text-foreground"
                    value={profileForm.firstName}
                    onChangeText={(text) =>
                      setProfileForm({ ...profileForm, firstName: text })
                    }
                    placeholder="Enter first name"
                  />
                ) : (
                  <Text className="text-foreground">{user.firstName}</Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-muted-foreground mb-2">
                  Last Name
                </Text>
                {isEditing ? (
                  <TextInput
                    className="border border-border rounded-lg px-3 py-2 text-foreground"
                    value={profileForm.lastName}
                    onChangeText={(text) =>
                      setProfileForm({ ...profileForm, lastName: text })
                    }
                    placeholder="Enter last name"
                  />
                ) : (
                  <Text className="text-foreground">{user.lastName}</Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-muted-foreground mb-2">
                  Email
                </Text>
                {isEditing ? (
                  <TextInput
                    className="border border-border rounded-lg px-3 py-2 text-foreground"
                    value={profileForm.email}
                    onChangeText={(text) =>
                      setProfileForm({ ...profileForm, email: text })
                    }
                    placeholder="Enter email"
                    keyboardType="email-address"
                  />
                ) : (
                  <Text className="text-foreground">{user.email}</Text>
                )}
              </View>

              {isEditing && (
                <TouchableOpacity
                  onPress={handleUpdateProfile}
                  disabled={isLoading}
                  className="bg-primary py-3 rounded-lg items-center"
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-medium">Save Changes</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Change Password */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-foreground">
                Change Password
              </Text>
              <TouchableOpacity
                onPress={() => setIsChangingPassword(!isChangingPassword)}
                className="px-3 py-1 bg-primary rounded-lg"
              >
                <Text className="text-white text-sm font-medium">
                  {isChangingPassword ? "Cancel" : "Change"}
                </Text>
              </TouchableOpacity>
            </View>

            {isChangingPassword && (
              <View className="bg-card rounded-xl p-4 border border-border">
                <View className="mb-4">
                  <Text className="text-sm font-medium text-muted-foreground mb-2">
                    Current Password
                  </Text>
                  <View className="flex-row items-center border border-border rounded-lg px-3">
                    <TextInput
                      className="flex-1 py-2 text-foreground"
                      value={passwordForm.currentPassword}
                      onChangeText={(text) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: text,
                        })
                      }
                      placeholder="Enter current password"
                      secureTextEntry={!showCurrentPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={20} className="text-muted-foreground" />
                      ) : (
                        <Eye size={20} className="text-muted-foreground" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-muted-foreground mb-2">
                    New Password
                  </Text>
                  <View className="flex-row items-center border border-border rounded-lg px-3">
                    <TextInput
                      className="flex-1 py-2 text-foreground"
                      value={passwordForm.newPassword}
                      onChangeText={(text) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: text,
                        })
                      }
                      placeholder="Enter new password"
                      secureTextEntry={!showNewPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff size={20} className="text-muted-foreground" />
                      ) : (
                        <Eye size={20} className="text-muted-foreground" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-muted-foreground mb-2">
                    Confirm New Password
                  </Text>
                  <View className="flex-row items-center border border-border rounded-lg px-3">
                    <TextInput
                      className="flex-1 py-2 text-foreground"
                      value={passwordForm.confirmPassword}
                      onChangeText={(text) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: text,
                        })
                      }
                      placeholder="Confirm new password"
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} className="text-muted-foreground" />
                      ) : (
                        <Eye size={20} className="text-muted-foreground" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleChangePassword}
                  disabled={isLoading}
                  className="bg-primary py-3 rounded-lg items-center"
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-medium">Change Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Account Actions */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Account Actions
            </Text>
            <View className="bg-card rounded-xl border border-border">
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center p-4 border-b border-border"
              >
                <LogOut size={20} color="#ef4444" />
                <Text className="text-red-500 font-medium ml-3">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
