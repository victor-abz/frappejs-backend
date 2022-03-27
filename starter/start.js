const { spawn } = require('child_process');
const { getAppConfig, resolveAppDir } = require('./utils');
const appConfig = getAppConfig();
const NodeWatcher = require('./watcher');

module.exports = function start(mode) {
  if (mode === 'dev') {
    process.env.NODE_ENV = 'development';
    new NodeWatcher();
  } else {
    process.env.NODE_ENV = 'production';
    const nodePaths = appConfig.node.paths;
    spawn('node', [resolveAppDir(nodePaths.main)], { stdio: 'inherit' });
  }
};
