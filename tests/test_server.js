const server = require('frappe-backend/server');

if (require.main === module) {
  server.start({
    backend: 'sqlite',
    connectionParams: { dbPath: 'test.db' },
  });
}
