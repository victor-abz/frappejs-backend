require('dotenv').config();
const backends = {};
backends.sqlite = require('frappe-backend/backends/sqlite');
// backends.mysql = require('frappe-backend/backends/mysql');
// backends.http = require('frappe-backend/backends/http');
backends.pg = require('frappe-backend/backends/postgres');
// const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server, {});
const frappe = require('frappe-backend');
const restAPI = require('./restAPI');
const frappeModels = require('frappe-backend/models');
const common = require('frappe-backend/common');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { getAppConfig } = require('../starter/utils');
const { executeMiddlewareList } = require('frappe-backend/server/utils');
const logger = require('../starter/logger');

frappe.conf = getAppConfig();

const log = logger('[frappe-server]');
const warn = logger('frappe-server', 'red');

module.exports = {
  async start({
    backend,
    connectionParams,
    models,
    routes,
    middlewareList = [],
  }) {
    await this.init();

    if (models) {
      frappe.registerModels(models, 'server');
    }

    // database
    await this.initDb({
      backend: backend,
      connectionParams: connectionParams,
    });

    // app
    app.use(bodyParser.json({ limit: '200mb' }));
    app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

    app.use(morgan('tiny'));

    if (connectionParams.enableCORS) {
      app.use(cors());
    }

    // socketio
    io.on('connection', function (socket) {
      frappe.db.bindSocketServer(socket);
    });
    // // get server healthy
    // app.get('/', (req, res) => {
    //   res.send({
    //     message: `Server Up and Running`,
    //     success: true,
    //   });
    // });

    // get server healthy
    app.get(
      '/',
      frappe.asyncHandler(async function (request, response) {
        return response.json({
          message: `Server Up and Running`,
          success: true,
          data: null,
        });
      })
    );

    // global middlewares
    app.use(function (req, res, next) {
      executeMiddlewareList(middlewareList, req, res, next);
    });

    // Add Custom Routes
    routes?.setup?.(app);

    // Default Models Routes
    restAPI.setup(app, middlewareList);

    frappe.config.port = frappe.conf.dev.devServerPort;

    // listen
    server.listen(frappe.config.port, () => {
      log();
      log(`Running on http://localhost:${frappe.config.port}`);
    });

    frappe.app = app;
    frappe.server = server;

    frappe.SystemSettings = await frappe.getSingle('SystemSettings');
    // Handle Not found routes
    app.use(function (req, res, next) {
      res.status(404);
      // respond with json
      return res.json({
        message: 'Url Not found',
        success: false,
        error: 'Url Not found',
      });
    });

    // setRouteForPDF();
  },

  async init() {
    frappe.isServer = true;
    frappe.init();
    frappe.registerModels(frappeModels, 'server');
    frappe.registerLibs(common);

    await frappe.login('Administrator');
  },

  async initDb({ backend, connectionParams }) {
    frappe.db = await new backends[backend](connectionParams);
    await frappe.db.connect();
    await frappe.db.migrate();
    await frappe.db.executePostDbConnect();
  },
};
