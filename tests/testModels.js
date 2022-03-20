const assert = require('assert');
const frappe = require('frappe-backend');
const helpers = require('./helpers');

describe('Models', () => {
  before(async function () {
    await helpers.initSqlite();
  });

  it('should get todo json', () => {
    let todo = frappe.getMeta('ToDo');
    assert.equal(todo.isSingle, 0);
  });
});
