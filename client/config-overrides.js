const path = require("path");
const {
  override,
  addWebpackAlias,
  addWebpackResolve,
} = require("customize-cra");

module.exports = override(
  // Add alias for dotenv to resolve to 'dotenv-safe' to include the shims
  addWebpackAlias({
    "dotenv": "dotenv-safe",
  }),

  // Add fallback for path, os, and crypto modules
  addWebpackResolve({
    fallback: {
      path: require.resolve("path-browserify"),
      os: require.resolve("os-browserify/browser"),
      crypto: require.resolve("crypto-browserify"),
    },
  })
);