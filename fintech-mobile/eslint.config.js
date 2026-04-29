// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      // Provided by `react-native-dotenv` (used for Expo env vars).
      "import/no-unresolved": ["error", { ignore: ["^@env$"] }],
    },
  }
]);
