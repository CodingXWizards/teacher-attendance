import { useState, useEffect, useCallback } from "react";
import { syncService, type SyncResult } from "../services/syncService";
import { useUserStore } from "../stores/userStore";
import { Alert } from "react-native";

export interface UseSyncReturn {
  isLoading: boolean;
  isSyncing: boolean;
  hasUnsyncedData: boolean;
  loadTeacherData: () => Promise<void>;
  syncDirtyRecords: () => Promise<void>;
  clearLocalData: () => Promise<void>;
  lastSyncResult: SyncResult | null;
}

export const useSync = (): UseSyncReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasUnsyncedData, setHasUnsyncedData] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const { user } = useUserStore();

  // Check for unsynced data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      checkUnsyncedData();
    }
  }, [user?.id]);

  const checkUnsyncedData = useCallback(async () => {
    try {
      const hasUnsynced = await syncService.hasUnsyncedRecords();
      setHasUnsyncedData(hasUnsynced);
    } catch (error) {
      console.error("Error checking unsynced data:", error);
    }
  }, []);

  const loadTeacherData = useCallback(async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not found");
      return;
    }

    setIsLoading(true);
    try {
      const result = await syncService.loadTeacherData(user.id);
      setLastSyncResult(result);

      if (result.success) {
        console.log("Teacher data loaded successfully:", result.message);
        if (result.data) {
          console.log(
            `Loaded: ${result.data.classes} classes, ${result.data.students} students, ${result.data.subjects} subjects`,
          );
        }
      } else {
        Alert.alert("Sync Error", result.message);
      }
    } catch (error) {
      console.error("Error loading teacher data:", error);
      Alert.alert("Error", "Failed to load teacher data");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const syncDirtyRecords = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await syncService.syncDirtyRecords();
      setLastSyncResult(result);

      if (result.success) {
        console.log("Sync completed:", result.message);
        await checkUnsyncedData(); // Refresh unsynced status
      } else {
        Alert.alert("Sync Error", result.message);
      }
    } catch (error) {
      console.error("Error syncing records:", error);
      Alert.alert("Error", "Failed to sync records");
    } finally {
      setIsSyncing(false);
    }
  }, [checkUnsyncedData]);

  const clearLocalData = useCallback(async () => {
    try {
      await syncService.clearLocalData();
      setHasUnsyncedData(false);
      setLastSyncResult(null);
      console.log("Local data cleared successfully");
    } catch (error) {
      console.error("Error clearing local data:", error);
      Alert.alert("Error", "Failed to clear local data");
    }
  }, []);

  return {
    isLoading,
    isSyncing,
    clearLocalData,
    lastSyncResult,
    hasUnsyncedData,
    loadTeacherData,
    syncDirtyRecords,
  };
};
