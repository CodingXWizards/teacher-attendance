module.exports = {
  presets: ["@react-native/babel-preset", "nativewind/babel"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./src"],
        alias: {
          "@": "./src",
        },
      },
    ],
    ["inline-import", { extensions: [".sql"] }],
    "react-native-reanimated/plugin",
  ],
};
