const frappe = require('frappe-backend');
const server = require('frappe-backend/server');
const SQLite = require('frappe-backend/backends/sqlite');
const PG = require('frappe-backend/backends/postgres');

let ToDo = {
  name: 'ToDo',
  label: 'To Do',
  naming: 'autoincrement',
  isSingle: 0,
  keywordFields: ['subject', 'description'],
  titleField: 'subject',
  fields: [
    {
      fieldname: 'subject',
      label: 'Subject',
      placeholder: 'Subject',
      fieldtype: 'Data',
      required: 1,
    },
    {
      fieldname: 'status',
      label: 'Status',
      fieldtype: 'Select',
      options: ['Open', 'Closed'],
      default: 'Open',
      required: 1,
    },
    {
      fieldname: 'description',
      label: 'Description',
      fieldtype: 'Text',
    },
  ],
};
module.exports = {
  async initSqlite({ dbPath = '_test.db', models } = {}) {
    server.init();
    if (models) {
      frappe.registerModels({ ToDo, ...models }, 'server');
    } else {
      frappe.registerModels({ ToDo }, 'server');
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
