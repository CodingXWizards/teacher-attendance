import { open } from "react-native-quick-sqlite";
import { drizzle } from "drizzle-orm/sqlite-core";
import * as schema from "./schema";

// Database name
export const DATABASE_NAME = "teacher-attendance-v2";

// Initialize database
let database: any = null;

export const initDatabase = async (): Promise<any> => {
  if (database) {
    return database;
  }

  try {
    const sqlite = open({
      name: DATABASE_NAME,
      location: "default",
    });

    // Create a custom adapter for react-native-quick-sqlite
    const adapter = {
      query: (sql: string, params: any[] = []) => {
        const result = sqlite.execute(sql, params);
        return {
          rows: result.rows,
          rowCount: result.rows.length,
        };
      },
      execute: (sql: string, params: any[] = []) => {
        return sqlite.execute(sql, params);
      },
    };

    // Create Drizzle database instance
    database = drizzle(adapter, { schema });

    console.log("Database initialized successfully");
    return database;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Export database instance
export const db = database;
