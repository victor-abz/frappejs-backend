const server = require('./server');
server.start({
	backend: 'pg',
	connectionParams: {
		// db_path: 'test.db',
		db_name: 'frappe_db',
		username: 'victor',
		password: '123456',
		host: 'localhost',
		client: 'pg',
	},
});
