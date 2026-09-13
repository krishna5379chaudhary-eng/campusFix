const globals = require("globals");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
    {
        files: ["**/*.js"],
        ignores: ["node_modules/**", "public/uploads/**"],
        languageOptions: {
            globals: globals.node
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error",
            "no-unreachable": "error"
        }
    }
]);