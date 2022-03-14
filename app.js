require('module-alias/register');
const server = require('./server');

server.start({
	backend: 'sqlite',
	connectionParams: {
		db_path: 'test.db',
	},
});
