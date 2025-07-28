import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { initDatabase, createDbHelpers } from "@/db";

interface DatabaseContextType {
  database: any;
  dbHelpers: ReturnType<typeof createDbHelpers> | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  database: null,
  dbHelpers: null,
});

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
}) => {
  const [database, setDatabase] = useState<any>(null);
  const [dbHelpers, setDbHelpers] = useState<ReturnType<
    typeof createDbHelpers
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log("🔄 Initializing database...");
        const db = await initDatabase();
        const helpers = createDbHelpers(db);

        setDatabase(db);
        setDbHelpers(helpers);
        console.log("✅ Database initialized successfully");
      } catch (error) {
        console.error("❌ Database initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{ database, dbHelpers }}>
      {children}
    </DatabaseContext.Provider>
  );
};
