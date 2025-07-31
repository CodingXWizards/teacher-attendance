import { ActivityIndicator, View } from "react-native";
import React, { createContext, useContext, useEffect, useState } from "react";

import watermelonDB from "@/db";

interface DatabaseContextType {
  database: any;
}

const DatabaseContext = createContext<DatabaseContextType>({
  database: null,
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log("🔄 Initializing WatermelonDB...");

        // WatermelonDB is already initialized when imported
        if (watermelonDB) {
          setDatabase(watermelonDB);
          console.log("✅ WatermelonDB initialized successfully");
        } else {
          throw new Error("WatermelonDB instance is null");
        }
      } catch (error) {
        console.error("❌ Database initialization failed:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
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
    <DatabaseContext.Provider value={{ database }}>
      {children}
    </DatabaseContext.Provider>
  );
};
