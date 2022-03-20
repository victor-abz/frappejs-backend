require('dotenv').config();
const backends = {};
backends.sqlite = require('frappe-backend/backends/sqlite');
backends.mysql = require('frappe-backend/backends/mysql');
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
const { getAppConfig } = require('../webpack/utils');

frappe.conf = getAppConfig();

module.exports = {
  async start({ backend, connectionParams, models }) {
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
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(morgan('tiny'));

    if (connectionParams.enableCORS) {
      app.use(cors());
    }

    // socketio
    io.on('connection', function (socket) {
      console.log('???<<< SOCKET Connection >>>>??');
      frappe.db.bindSocketServer(socket);
    });
    // routes
    restAPI.setup(app);

    frappe.config.port = frappe.conf.dev.devServerPort;

    // listen
    server.listen(frappe.config.port, () => {
      console.log(
        `frappe server running on http://localhost:${frappe.config.port}`
      );
    });

    frappe.app = app;
    frappe.server = server;

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
  },
};
