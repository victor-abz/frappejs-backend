# Creating a new App

## Install frappe-backend

```
yarn add frappe-backend
```

Frappe Backend comes with an Express Server on the backend and a CLI to run these things with built-in webpack configs.

## Config

Frappe Backend requires a file named `frappe-backend.conf.js` to be present in the root of your directory. Minimum configuration looks like:

```js
module.exports = {
  dev: {
    devServerPort: process.env.PORT || 3000,
    devServerHost: 'localhost',
  },
  baseDir: '.', // If you want the model codes to be in another folder such as src
  useEs6: true, // If you want to generate models in ES6 Format
  node: {
    paths: {
      main: 'app.js',
    },
  },
};
```

### Server

Assuming you have a `app.js` file in your root directory, you can start the Frappe Backend server in just a few lines of code.

```js
const server = require('frappe-backend/server');

console.log(process.env.PORT);
server.start({
  backend: 'pg', // Start Postgres Server, Options are [sqlite, mysql]
  connectionParams: {
    db_name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PWD,
    host: process.env.DB_HOST,
    client: 'pg',
  },
  enableCORS: true,
});
```

## Start

To start the server add this to your `package.json`

```bash
{
  ...
  "scripts": {
    "start": "frp start"
  }
  ...
}
```
