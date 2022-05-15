const server = require('frappe-backend/server');

const ToDo = {
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

if (require.main === module) {
  server.start({
    backend: 'pg', // To start a postgres backend.
    connectionParams: {
      knexParams: {
        asyncStackTraces: false,
        debug: false,
      },
      db_name: 'timesheet_test', // Existing postgres database name
      username: 'victor', // Database username
      password: '123456', // Database password
      host: 'localhost', // Database host
      client: 'pg', // Database client. options are [pg]
    },
    models: { ToDo },
  });
}
