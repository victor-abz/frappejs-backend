module.exports = {
	dev: {
		devServerPort: process.env.PORT || 3000,
		devServerHost: 'localhost',
	},
	node: {
		paths: {
			main: 'app.js',
		},
	},
};
