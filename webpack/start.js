const { spawn } = require('child_process');
const { getAppConfig, resolveAppDir } = require('./utils');
const appConfig = getAppConfig();

module.exports = function start(mode) {
  process.env.NODE_ENV = 'development';
  console.log(appConfig);

  const nodePaths = appConfig.node.paths;
  spawn('node', [resolveAppDir(nodePaths.main)], { stdio: 'inherit' });
};
