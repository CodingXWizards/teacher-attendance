import { Suspense } from "react";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { ActivityIndicator } from "react-native";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";

import migrations from "@/db/migrations/migrations";

export const DATABASE_NAME = "teacher-attendance-v2";

export default function RootLayout() {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        onInit={async (database) => {
          try {
            console.log("Starting database migration...");
            console.log("Database name:", DATABASE_NAME);
            
            const db = drizzle(database);
            console.log("Drizzle instance created");
            
            await migrate(db, migrations);
            console.log("Migration Success - Database tables created");
          } catch (error) {
            console.error("Migration Error:", error);
            console.error("Migration error details:", JSON.stringify(error, null, 2));
          }
        }}
      >
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#2196F3",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Teacher Attendance",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="attendance"
            options={{
              title: "Take Attendance",
            }}
          />
          <Stack.Screen
            name="history"
            options={{
              title: "Attendance History",
            }}
          />
          <Stack.Screen
            name="teachers"
            options={{
              title: "Manage Teachers",
            }}
          />
          <Stack.Screen
            name="reports"
            options={{
              title: "Reports",
            }}
          />
        </Stack>
      </SQLiteProvider>
    </Suspense>
  );
}
