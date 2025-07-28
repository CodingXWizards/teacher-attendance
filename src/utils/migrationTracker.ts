import AsyncStorage from "@react-native-async-storage/async-storage";

const MIGRATION_VERSION_KEY = "db_migration_version";
const CURRENT_MIGRATION_VERSION = "1.0.0"; // Update this when you have new migrations

export class MigrationTracker {
  static async getCurrentVersion(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(MIGRATION_VERSION_KEY);
    } catch (error) {
      console.error("Error getting migration version:", error);
      return null;
    }
  }

  static async setCurrentVersion(version: string): Promise<void> {
    try {
      await AsyncStorage.setItem(MIGRATION_VERSION_KEY, version);
    } catch (error) {
      console.error("Error setting migration version:", error);
    }
  }

  static async needsMigration(): Promise<boolean> {
    const currentVersion = await this.getCurrentVersion();
    return currentVersion !== CURRENT_MIGRATION_VERSION;
  }

  static async markMigrationComplete(): Promise<void> {
    await this.setCurrentVersion(CURRENT_MIGRATION_VERSION);
  }

  static getCurrentMigrationVersion(): string {
    return CURRENT_MIGRATION_VERSION;
  }
}
