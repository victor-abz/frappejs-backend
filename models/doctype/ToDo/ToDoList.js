const BaseList = require('frappe-backend/client/view/list');

module.exports = class ToDoList extends BaseList {
	getFields(list) {
		return ['name', 'subject', 'status'];
	}
};
