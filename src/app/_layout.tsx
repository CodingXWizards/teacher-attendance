import "./global.css";

import { Suspense, useCallback } from "react";
import { ActivityIndicator, View } from "react-native";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { useThemeStore } from "@/stores/themeStore";

import migrations from "@/db/migrations/migrations";
import { MigrationTracker } from "@/utils/migrationTracker";

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

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        onInit={runMigration}
      >
        <AppRouter />
      </SQLiteProvider>
    </Suspense>
  );
}

export default RootLayoutContent;
