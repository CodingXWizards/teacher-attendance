const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add SQL file extensions
config.resolver.sourceExts.push("sql");

// Configure resolver to handle @ alias and src directory
config.resolver.alias = {
  "@": path.resolve(__dirname, "src"),
};

// Add src directory to resolver platforms
config.resolver.platforms = ["ios", "android", "native", "web"];

// Configure watch folders to include src
config.watchFolders = [
  path.resolve(__dirname, "src"),
  path.resolve(__dirname, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./src/app/global.css" });
