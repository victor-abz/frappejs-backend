const spawn = require('child_process').spawn;
const chokidar = require('chokidar');
const { getAppConfig, resolveAppDir } = require('./utils');
const logger = require('./logger');
const _ = require('lodash');
const pck = require('../package.json');
const chalk = require('chalk');

module.exports = class NodeWatcher {
  constructor() {
    this.__init__();
  }
  __init__ = () => {
    this.warn = logger('frappe-watcher:', 'red');
    this.log = logger('frappe-watcher:');
    this.frappeConf = 'frappe-backend.conf.js';

    this.appConfig = getAppConfig();
    this.nodePaths = this.appConfig.node.paths;

    this.ignoredPaths = _.each(this.appConfig.nodemon.ignore, (dir) => {
      resolveAppDir(dir);
    });

    this.watchPaths = [];
    this.acceptedFileExtensions = this.appConfig.nodemon.ext
      ? this.appConfig.nodemon.ext
      : ['.js'];

    if (!this.appConfig.nodemon.watch) {
      this.warn(
        `Please specify folder to watch in ${chalk.yellow(
          this.frappeConf
        )} file`
      );
      process.exit(1);
    }
    if (!this.appConfig.nodemon.entry) {
      this.warn(
        `Please specify entry or main file in ${chalk.yellow(frappeConf)} file`
      );
      process.exit(1);
    }
    if (!this.appConfig.nodemon.exec) {
      this.warn(
        `Please specify execution command in ${chalk.yellow(frappeConf)} file`
      );
      process.exit(1);
    }
    // Watch specified file types
    _.each(this.appConfig.nodemon.watch, (dir) => {
      this.buildWildcardList(resolveAppDir(dir));
    });

    this.logInit();
    this.reload();
    this.startWatching();
    this.listeningEvents();
  };

  reload = () => {
    this.log(`starting ${this.appConfig.nodemon.exec}`);
    if (this.nodeServer) this.nodeServer.kill('SIGTERM');

    this.nodeServer = spawn(
      this.appConfig.nodemon.exec,
      [resolveAppDir(this.appConfig.nodemon.entry)],
      {
        stdio: 'inherit',
      }
    );

    this.nodeServer.on('close', () => {
      this.warn('App crashed. Waiting for changes to restart....');
    });
  };

  startWatching = () => {
    chokidar
      .watch(this.watchPaths, {
        ignored: this.ignoredPaths,
        ignoreInitial: true,
      })
      .on('all', (event, path) => {
        // if (this.debounceTimer) clearTimeout(this.debounceTimer);
        // this.debounceTimer = setTimeout(() => {
        //   this.reload();
        // }, 500);
        this.reload();
      });
  };

  listeningEvents = () => {
    // listening on CLI input
    process.stdin.on('data', (chunk) => {
      let cliInput = chunk.toString();

      switch (cliInput) {
        case 'rs\n':
          this.reload();
          break;
      }
    });
  };

  logInit = () => {
    this.log(`v${pck.version}`);
    this.log('to restart at any time, enter `rs`');
  };

  buildWildcardList = (path) => {
    _.each(this.acceptedFileExtensions, (extension) => {
      this.watchPaths.push(path + '/**/*' + extension);
    });
    return path;
  };
};
