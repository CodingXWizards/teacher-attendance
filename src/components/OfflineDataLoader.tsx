import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useSync } from "../hooks/useSync";
import { useUserStore } from "../stores/userStore";
import { databaseService } from "../services/databaseService";
import { ActivityIndicator } from "react-native";

interface OfflineDataLoaderProps {
  children: React.ReactNode;
}

export const OfflineDataLoader: React.FC<OfflineDataLoaderProps> = ({
  children,
}) => {
  const { user } = useUserStore();
  const {
    isLoading,
    isSyncing,
    hasUnsyncedData,
    loadTeacherData,
    syncDirtyRecords,
    lastSyncResult,
  } = useSync();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user?.id && !isInitialized) {
      initializeTeacherData();
    }
  }, [user?.id, isInitialized]);

  const initializeTeacherData = async () => {
    try {
      console.log("🔄 Initializing teacher data...");
      await loadTeacherData();
      setIsInitialized(true);
      console.log("✅ Teacher data initialized");
    } catch (error) {
      console.error("❌ Failed to initialize teacher data:", error);
      Alert.alert("Error", "Failed to load teacher data. Please try again.");
    }
  };

  const handleSync = async () => {
    try {
      await syncDirtyRecords();
    } catch (error) {
      console.error("❌ Sync failed:", error);
    }
  };

  // Show loading screen while initializing
  if (user?.id && !isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16, fontSize: 16, textAlign: "center" }}>
          Loading your data...
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 14,
            textAlign: "center",
            color: "#666",
          }}
        >
          This may take a moment on first login
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Sync status bar */}
      {hasUnsyncedData && (
        <View
          style={{
            backgroundColor: "#ff9800",
            padding: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 14 }}>
            📱 You have unsynced data
          </Text>
          <TouchableOpacity
            onPress={handleSync}
            disabled={isSyncing}
            style={{
              backgroundColor: "white",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "#ff9800", fontWeight: "600" }}>
              {isSyncing ? "Syncing..." : "Sync Now"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main content */}
      {children}

      {/* Debug info (remove in production) */}
      {__DEV__ && lastSyncResult && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: "rgba(0,0,0,0.8)",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontSize: 12 }}>
            Last sync: {lastSyncResult.success ? "✅" : "❌"}{" "}
            {lastSyncResult.message}
          </Text>
        </View>
      )}
    </View>
  );
};
