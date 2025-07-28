const { withNativeWind } = require("nativewind/metro")
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config")

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    sourceExts: ["js", "jsx", "json", "ts", "tsx", "css"],
  },
}

module.exports = withNativeWind(
  mergeConfig(getDefaultConfig(__dirname), config),
  {
    input: "./src/app/global.css",
    inlineRem: 16,
  },
)
