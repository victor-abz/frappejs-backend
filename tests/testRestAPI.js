const assert = require('assert');
const frappe = require('frappe-backend');
const fetch = require('node-fetch');
const { spawn } = require('child_process');
const process = require('process');
const HTTPClient = require('frappe-backend/backends/http');
const utils = require('frappe-backend/utils');
const models = require('frappe-backend/models');
const common = require('frappe-backend/common');

// create a copy of frappe
const ToDo = {
  name: 'ToDo',
  label: 'To Do',
  naming: 'autoincrement',
  isSingle: 0,
  keywordFields: ['subject', 'description'],
  titleField: 'subject',
  fields: [
    {
      fieldname: 'subject',
      label: 'Subject',
      placeholder: 'Subject',
      fieldtype: 'Data',
      required: 1,
    },
    {
      fieldname: 'status',
      label: 'Status',
      fieldtype: 'Select',
      options: ['Open', 'Closed'],
      default: 'Open',
      required: 1,
    },
    {
      fieldname: 'description',
      label: 'Description',
      fieldtype: 'Text',
    },
  ],
};

var test_server;

describe('REST', () => {
  before(async function () {
    test_server = spawn('node', ['tests/test_server.js'], { stdio: 'inherit' });

    // frappe.db = await new HTTPClient({ server: 'localhost:8000' });
    // frappe.fetch = fetch;

    // wait for server to start
    return await utils.sleep(2);
  });

  after(() => {
    frappe.close();
    test_server.kill();
  });

  it('REST: should create a document', async () => {
    let doc = frappe.newDoc({ doctype: 'ToDo', subject: 'test rest insert 1' });
    await doc.insert();

    let doc1 = await frappe.getDoc('ToDo', doc.name);
    assert.equal(doc.subject, doc1.subject);
    assert.equal(doc1.status, 'Open');
  });

  it('REST: should update a document', async () => {
    let doc = frappe.newDoc({ doctype: 'ToDo', subject: 'test rest insert 1' });
    await doc.insert();

    doc.subject = 'subject changed';
    await doc.update();

    let doc1 = await frappe.getDoc('ToDo', doc.name);
    assert.equal(doc.subject, doc1.subject);
  });

  it('REST: should get multiple documents', async () => {
    await frappe.insert({ doctype: 'ToDo', subject: 'all test 1' });
    await frappe.insert({ doctype: 'ToDo', subject: 'all test 2' });

    let data = await frappe.db.getAll({ doctype: 'ToDo' });
    let subjects = data.map((d) => d.subject);
    assert.ok(subjects.includes('all test 1'));
    assert.ok(subjects.includes('all test 2'));
  });

  it('REST: should delete a document', async () => {
    let doc = frappe.newDoc({ doctype: 'ToDo', subject: 'test rest insert 1' });

    await doc.insert();
    assert.equal(await frappe.db.exists(doc.doctype, doc.name), true);

    await doc.delete();
    assert.equal(await frappe.db.exists(doc.doctype, doc.name), false);
  });

  it('REST: should delete multiple documents', async () => {
    let doc1 = frappe.newDoc({
      doctype: 'ToDo',
      subject: 'test rest insert 5',
    });
    let doc2 = frappe.newDoc({
      doctype: 'ToDo',
      subject: 'test rest insert 6',
    });

    await doc1.insert();
    await doc2.insert();
    assert.equal(await frappe.db.exists(doc1.doctype, doc1.name), true);
    assert.equal(await frappe.db.exists(doc2.doctype, doc2.name), true);

    await frappe.db.deleteMany(doc1.doctype, [doc1.name, doc2.name]);
    assert.equal(await frappe.db.exists(doc1.doctype, doc1.name), false);
    assert.equal(await frappe.db.exists(doc2.doctype, doc2.name), false);
  });
});
