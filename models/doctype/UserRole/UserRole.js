const { t } = require('frappe-backend');

module.exports = {
	name: 'UserRole',
	doctype: 'DocType',
	isSingle: 0,
	isChild: 1,
	keywordFields: [],
	fields: [
		{
			fieldname: 'role',
			label: t`Role`,
			fieldtype: 'Link',
			target: 'Role',
		},
	],
};
