const fs = require('fs');
const path = require('path');
const getDirName = path.dirname;
const os = require('os');
const async = require('async');

module.exports = {
  writeFile(fullpath, contents) {
    return new Promise((resolve, reject) => {
      fs.mkdir(getDirName(fullpath), { recursive: true }, (err) => {
        if (err) reject(err);
        fs.writeFile(fullpath, contents, (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });
  },

  readFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
  },

  getTmpDir() {
    return os.tmpdir();
  },

  // Execute middleware passed to route.
  executeMiddlewareList(middlewareList, req, res, next) {
    async.eachSeries(
      middlewareList,
      function (middleware, callback) {
        middleware.bind(null, req, res, callback)();
      },
      function (err) {
        if (err) return res.status(500).json({ error: err });
        next();
      }
    );
  },
};
