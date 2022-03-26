module.exports = {
  dev: {
    devServerPort: process.env.PORT || 3000,
    devServerHost: 'localhost',
  },
  baseDir: '.', // Base Dir for Models
  useEs6: true, // Create Models in ES6
  node: {
    paths: {
      main: 'app.js',
    },
  },
};
