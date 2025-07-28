import "./global.css";

import { Suspense, useCallback, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { useThemeStore } from "@/stores/themeStore";
import { NetworkProvider } from 'react-native-offline';

import migrations from "@/db/migrations/migrations";
import { MigrationTracker } from "@/utils/migrationTracker";
import AttendanceService from "@/services/attendance"; // You'll need to create this

import AppRouter from "./_router";

export const DATABASE_NAME = "teacher-attendance-v2";

function RootLayoutContent() {
  const runMigration = useCallback(async (database: SQLiteDatabase) => {
    try {
      // Check if migration is needed
      const needsMigration = await MigrationTracker.needsMigration();

      if (needsMigration) {
        console.log("🔄 Running database migrations...");
        const db = drizzle(database);
        await migrate(db, migrations);
        await MigrationTracker.markMigrationComplete();
        console.log("✅ Database migration completed successfully");
      } else {
        console.log("✅ Database is up to date, skipping migration");
      }
    } catch (error) {
      console.error("Migration Error:", error);
      console.error("Migration error details:", JSON.stringify(error, null, 2));
    }
  }, []);

  // Auto-sync setup
  useEffect(() => {
    const syncOnStartup = async () => {
      try {
        await AttendanceService.syncPendingOperations();
      } catch (error) {
        console.log("Sync failed on startup:", error);
      }
    };

    syncOnStartup();

    // Set up periodic sync (every 30 seconds when online)
    const syncInterval = setInterval(() => {
      AttendanceService.syncPendingOperations();
    }, 30000);

    return () => clearInterval(syncInterval);
  }, []);

  return (
    <NetworkProvider>
      <Suspense fallback={<ActivityIndicator size="large" />}>
        <SQLiteProvider
          databaseName={DATABASE_NAME}
          options={{ enableChangeListener: true }}
          onInit={runMigration}
        >
          <AppRouter />
        </SQLiteProvider>
      </Suspense>
    </NetworkProvider>
  );
}

export default RootLayoutContent;
