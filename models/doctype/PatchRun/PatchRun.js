const { t } = require('frappe-backend');

module.exports = {
	name: 'PatchRun',
	fields: [
		{
			fieldname: 'name',
			fieldtype: 'Data',
			label: t`Name`,
		},
	],
};
