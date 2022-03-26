# Frappe-backend.js

Frappe backend is a meta-data driven backend framework that enables rapid application development of Node.js REST API.
Inspired by [frappejs](https://github.com/frappe/frappejs) a product from [Frappe](https://frappeframework.com).

The objective of Frappe Backend is be a clean and opinionated micro-framework to develop small-business applications.

So, I love the simplicity of frappejs, and the Schema defined in the frappe framework to act as a Document Oriented framework, but using the power of a Relational Database Engine, what simplify and boost the level of coherence in the system.

## Features

- Rapid REST-API Development
- Database backends

## Quick Started

### Initialize a new NodeJS project

`mkdir fback-demo && cd fback-demo`
`npm init -y`

### Install Frappe Backend

`npm i frappe-backend`

add the Following to your package.json
To start the server add this to your `package.json`

```bash
{
  ...
  "scripts": {
	"new-model": "frp-cmd new-model",
    "start": "frp-cmd start"
  }
  ...
}
```

### Create app Entry file for your project. e.g app.js and backend config file

```js
const server = require('frappe-backend/server');

console.log(process.env.PORT);
server.start({
  backend: 'pg', // To start a postgres backend.
  connectionParams: {
    db_name: process.env.DB_NAME, // Existing postgres database name
    username: process.env.DB_USERNAME, // Database username
    password: process.env.DB_PWD, // Database password
    host: process.env.DB_HOST, // Database host
    client: 'pg', // Database client. options are [pg]
  },
  enableCORS: true,
});
```

Create `frappe-backend.conf.js` file at the root directory of your project. Minimum config look like:

```js
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
```

### To Generate your first Model(model is like database table). Example ToDo:

Now run `npm run new_model ToDo`
This will create a new model in `models/doctype` called ToDo
it will include a name field which represent the ID of each record. Go ahead and add the following fields under fields.:
[Read this to Understand more about models](docs/models/index.md)

```js
{
	fieldname: 'subject',
	label: t`Subject`,
	placeholder: 'Subject',
	fieldtype: 'Data',
	required: 1,
},
{
	fieldname: 'status',
	label: t`Status`,
	fieldtype: 'Select',
	options: ['Open', 'Closed'],
	default: 'Open',
	required: 1,
},
{
	fieldname: 'description',
	label: t`Description`,
	fieldtype: 'Text',
},
```

Your ToDo.js Model should like this now:

```js
module.exports = {
  name: 'ToDo',
  label: 'ToDo',
  naming: 'name', // {random|autoincrement}
  isSingle: 0,
  isChild: 0,
  isSubmittable: 0,
  settings: null,
  keywordFields: [],
  fields: [
    {
      fieldname: 'name',
      label: 'Name',
      fieldtype: 'Data',
      required: 1,
    },
    {
      fieldname: 'subject',
      label: t`Subject`,
      placeholder: 'Subject',
      fieldtype: 'Data',
      required: 1,
    },
    {
      fieldname: 'status',
      label: t`Status`,
      fieldtype: 'Select',
      options: ['Open', 'Closed'],
      default: 'Open',
      required: 1,
    },
    {
      fieldname: 'description',
      label: t`Description`,
      fieldtype: 'Text',
    },
  ],
};
```

Import models folder in your entry file

```js
const server = require('frappe-backend/server');
const models = require('./models'); // Import Models folder

console.log(process.env.PORT);
server.start({
  backend: 'pg', // To start a postgres backend.
  connectionParams: {
    db_name: process.env.DB_NAME, // Existing postgres database name
    username: process.env.DB_USERNAME, // Database username
    password: process.env.DB_PWD, // Database password
    host: process.env.DB_HOST, // Database host
    client: 'pg', // Database client. options are [pg]
  },
  enableCORS: true,
  models, // Your Import
});
```

### Start Server

now run your server with `npm run start`. Your NodeJs Server will start at specified port.
Go to your Postman and you should be able to consume RestAPI to your ToDo model.
[check this RestAPI Documentation](docs/server/rest.md)

## Documentation

[Read the full docs](docs/index.md)

## ToDo

- [x] Allow custom Routes and overriding
- [ ] Pass custom Middleware to routes
- [ ] Integrate various type of Authentication
- [ ] Convert Package to ES6 and Typescript

## Contribution

You are welcome to contibute. Just raise the PR.

## License

MIT
