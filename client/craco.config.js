const path = require("path");

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          // Add the fallback for 'path' module
          path: require.resolve("path-browserify"),
        },
      },
    },
  },
};