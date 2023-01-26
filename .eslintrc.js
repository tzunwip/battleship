module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true,
    cypress: true,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  overrides: [
    {
      files: ["test/**"],
      plugins: ["jest"],
      extends: ["plugin:jest/recommended"],
      rules: { "jest/prefer-expect-assertions": "off" },
    },
    {
      files: ["cypress/**/*.js"],
      plugins: ["cypress"],
      extends: ["plugin:cypress/recommended"],
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["prettier"],
  ignorePatterns: ["dist/*"],
};
