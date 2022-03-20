const frappe = require('frappe-backend');
const server = require('frappe-backend/server');
const SQLite = require('frappe-backend/backends/sqlite');
const PG = require('frappe-backend/backends/postgres');

module.exports = {
  async initSqlite({ dbPath = '_test.db', models } = {}) {
    console.log('first');
    server.init();
    if (models) {
      frappe.registerModels(models, 'server');
    }

    frappe.db = new SQLite({ dbPath });
    await frappe.db.connect();
    await frappe.db.migrate();
  },
  //   async initSqlite({ dbPath = '_test.db', models } = {}) {
  //     server.init();
  //     if (models) {
  //       frappe.registerModels(models, 'server');
  //     }

  //     frappe.db = new SQLite({ dbPath });
  //     await frappe.db.connect();
  //     await frappe.db.migrate();
  //   },
};
