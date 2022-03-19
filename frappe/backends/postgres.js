// const frappe = require('frappe');
const Database = require('./database');

class PostgresDatabase extends Database {
	constructor({ db_name, username, password, host }) {
		super();
		this.db_name = db_name;
		this.username = username;
		this.password = password;
		this.host = host;
		this.connectionParams = {
			client: 'pg',
			connection: {
				host: this.host,
				port: this.db_port || 5432,
				user: this.username,
				password: this.password,
				database: this.db_name,
			},
		};
	}

	async addForeignKeys(doctype, newForeignKeys) {
		// Disble FOregn key on table with Postgres Query
		await this.sql(`ALTER TABLE "${doctype}" DISABLE TRIGGER user`);
		// await this.sql('BEGIN TRANSACTION');

		const tempName = 'TEMP' + doctype;

		// create temp table
		await this.knex.schema.dropTableIfExists(tempName);
		await this.createTable(doctype, tempName);

		// copy from old to new table
		await this.knex(tempName).insert(this.knex.select().from(doctype));

		// drop old table
		await this.knex.schema.dropTable(doctype);

		// rename new table
		await this.createTable(doctype);
		await this.knex(doctype).insert(this.knex.select().from(tempName));
		await this.knex.schema.dropTableIfExists(tempName);

		await this.sql('COMMIT');
		await this.sql(`ALTER TABLE "${doctype}" ENABLE TRIGGER user`);
	}

	removeColumns() {
		// pass
	}

	async getTableColumns(doctype) {
		const rows = await this.knex
			.select('column_name')
			.from('information_schema.columns')
			.where('table_name', doctype);

		return rows.map((d) => d.column_name);
	}

	async getForeignKeys(doctype) {
		const rows = await this.knex
			.select('constraint_name')
			.from('information_schema.table_constraints')
			.where('table_name', doctype);

		return rows.map((d) => d.constraint_name);
	}

	initTypeMap() {
		// prettier-ignore
		this.typeMap = {
      'AutoComplete': 'text',
      'Currency': 'text',
      'Int': 'integer',
      'Float': 'float',
      'Percent': 'float',
      'Check': 'integer',
      'Small Text': 'text',
      'Long Text': 'text',
      'Code': 'text',
      'Text Editor': 'text',
      'Date': 'text',
      'Datetime': 'text',
      'Time': 'text',
      'Text': 'text',
      'Data': 'text',
      'Link': 'text',
      'DynamicLink': 'text',
      'Password': 'text',
      'Select': 'text',
      'Read Only': 'text',
      'File': 'text',
      'Attach': 'text',
      'AttachImage': 'text',
      'Signature': 'text',
      'Color': 'text',
      'Barcode': 'text',
      'Geolocation': 'text'
    };
	}

	// getError(err) {
	// 	let errorType = frappe.errors.DatabaseError;
	// 	if (err.message.includes('FOREIGN KEY')) {
	// 		errorType = frappe.errors.LinkValidationError;
	// 	}
	// 	if (err.message.includes('SQLITE_ERROR: cannot commit')) {
	// 		errorType = frappe.errors.CannotCommitError;
	// 	}
	// 	if (
	// 		err.message.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed:')
	// 	) {
	// 		errorType = frappe.errors.DuplicateEntryError;
	// 	}
	// 	return errorType;
	// }
}

module.exports = PostgresDatabase;
