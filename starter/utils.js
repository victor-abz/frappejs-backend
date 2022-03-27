const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const defaultsDeep = require('lodash/defaultsDeep');
const logger = require('./logger');

const frappeConf = 'frappe-backend.conf.js';

function getAppDir() {
  let dir = process.cwd();

  if (fs.existsSync(path.join(dir, frappeConf))) {
    return dir;
  }

  warn = logger('utils', 'red');

  warn();
  warn(`Looks like this is not the root of a frappe project`);
  warn(
    `Please run this command from a folder which contains ${chalk.yellow(
      frappeConf
    )} file`
  );
  warn();
  process.exit(1);
}

function getAppConfig() {
  const defaults = {
    dev: {
      devServerHost: 'localhost',
      devServerPort: process.env.PORT || 8000,
    },
  };
  const appConfig = require(path.resolve(getAppDir(), frappeConf));
  return defaultsDeep(defaults, appConfig);
}

function resolveAppDir(...args) {
  return path.resolve(getAppDir(), ...args);
}

function isValidJS(fileName) {
  fileName = fileName.endsWith('.js') ? fileName : fileName + '.js';

  return fs.existsSync('./' + fileName);
}

function debounce(func, delay) {
  let debounceTimer;

  return function () {
    let context = this;
    let args = arguments;

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

module.exports = {
  getAppDir,
  getAppConfig,
  resolveAppDir,
  isValidJS,
  debounce,
};
