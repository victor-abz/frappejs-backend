const frappe = require('frappe-backend');
const path = require('path');
const multer = require('multer');

module.exports = {
  setup(app) {
    // get list
    app.get(
      '/api/resource/:doctype',
      frappe.asyncHandler(async function (request, response) {
        for (let key of ['fields', 'filters']) {
          if (request.query[key]) {
            request.query[key] = JSON.parse(request.query[key]);
          }
        }

        let data = await frappe.db.getAll({
          doctype: request.params.doctype,
          fields: request.query.fields || ['*'],
          filters: request.query.filters,
          start: request.query.start || 0,
          limit: request.query.limit || 20,
          order_by: request.query.order_by,
          order: request.query.order,
        });

        return response.json({
          message: `${request.params.doctype} data has been fetched successfully`,
          success: true,
          data,
        });
      })
    );

    // create
    app.post(
      '/api/resource/:doctype',
      frappe.asyncHandler(async function (request, response) {
        let data = request.body;
        data.doctype = request.params.doctype;
        let doc = frappe.newDoc(data);
        await doc.insert();
        await frappe.db.commit();
        return response.json({
          message: `${request.params.doctype} created successfully`,
          success: true,
          data: doc.getValidDict(),
        });
      })
    );

    // create mulitple
    app.post(
      '/api/resources/:doctype',
      frappe.asyncHandler(async function (request, response) {
        let data = request.body;
        let createdItems = [];
        for (let key of data) {
          key.doctype = request.params.doctype;
          let doc = frappe.newDoc(key);
          await doc.insert();
          await frappe.db.commit();
          createdItems.push(doc.getValidDict());
        }
        return response.json({
          message: `Multiple ${request.params.doctype} created successfully`,
          success: true,
          data: createdItems,
        });
      })
    );

    // Add child to parent
    app.post(
      '/api/resource/:doctype/:name/:childFieldname',
      frappe.asyncHandler(async function (request, response) {
        let doc = await frappe.getDoc(
          request.params.doctype,
          request.params.name
        );

        let childFieldname = request.params.childFieldname;
        if (!childFieldname)
          throw {
            message: `Body should contain array named '${childFieldname}'`,
            statusCode: 422,
          };

        let fields = frappe
          .getMeta(request.params.doctype)
          .getValidFields({ withChildren: true });
        //  fields is a list of object like  [{ fieldname: 'owner', fieldtype: 'Data', required: 1 }]
        // Check if childFieldname fieldName exist in the fields list
        let childField = fields.find(
          (field) => field.fieldname === childFieldname
        );
        if (!childField || childField?.fieldtype !== 'Table')
          throw {
            message: `Field ${childFieldname} does not exist in ${request.params.doctype}`,
            statusCode: 422,
          };

        //   return res.status(422).json({
        //     message: `Body should contain array name as ${childFieldname}`,
        //     success: false,
        //     data: [],
        //   });
        let data = request.body[childFieldname];
        // console.log(data);
        // Asyncronously map through data and add members to project
        data.map((d) => {
          doc.append(childFieldname, d);
        });
        await doc.update();
        await frappe.db.commit();

        return response.json({
          message: `Succesfully added`,
          success: true,
          data: doc.getValidDict(),
        });
      })
    );

    // update
    app.put(
      '/api/resource/:doctype/:name',
      frappe.asyncHandler(async function (request, response) {
        let data = request.body;
        let doc = await frappe.getDoc(
          request.params.doctype,
          request.params.name
        );
        Object.assign(doc, data);
        await doc.update();
        await frappe.db.commit();
        return response.json({
          message: `${request.params.doctype} updated successfully`,
          success: true,
          data: doc.getValidDict(),
        });
      })
    );

    const upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, frappe.conf.staticPath);
        },
        filename: (req, file, cb) => {
          const filename = file.originalname.split('.')[0];
          const extension = path.extname(file.originalname);
          const now = Date.now();
          cb(null, filename + '-' + now + extension);
        },
      }),
    });

    app.post(
      '/api/upload/:doctype/:name/:fieldname',
      upload.array('files', 10),
      frappe.asyncHandler(async function (request, response) {
        const files = request.files;
        const { doctype, name, fieldname } = request.params;

        let fileDocs = [];
        for (let file of files) {
          const doc = frappe.newDoc({
            doctype: 'File',
            name: path.join('/', file.path),
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            referenceDoctype: doctype,
            referenceName: name,
            referenceFieldname: fieldname,
          });
          await doc.insert();

          await frappe.db.setValue(doctype, name, fieldname, doc.name);

          fileDocs.push({
            message: `${request.params.doctype} file uploaded successfully`,
            success: true,
            data: doc.getValidDict(),
          });
        }

        return response.json(fileDocs);
      })
    );

    // get document
    app.get(
      '/api/resource/:doctype/:name',
      frappe.asyncHandler(async function (request, response) {
        let doc = await frappe.getDoc(
          request.params.doctype,
          request.params.name
        );
        return response.json({
          message: `${request.params.name} retrieved successfully`,
          success: true,
          data: doc.getValidDict(),
        });
      })
    );

    // get value
    app.get(
      '/api/resource/:doctype/:name/:fieldname',
      frappe.asyncHandler(async function (request, response) {
        let value = await frappe.db.getValue(
          request.params.doctype,
          request.params.name,
          request.params.fieldname
        );
        return response.json({
          message: `Value retrieved successfully`,
          success: true,
          data: { value: value },
        });
      })
    );

    // delete
    app.delete(
      '/api/resource/:doctype/:name',
      frappe.asyncHandler(async function (request, response) {
        let doc = await frappe.getDoc(
          request.params.doctype,
          request.params.name
        );
        await doc.delete();
        return response.json({
          message: `Value deleted successfully`,
          success: true,
        });
      })
    );

    // delete many
    app.delete(
      '/api/resource/:doctype',
      frappe.asyncHandler(async function (request, response) {
        let names = request.body;
        for (let name of names) {
          let doc = await frappe.getDoc(request.params.doctype, name);
          await doc.delete();
        }
        return response.json({
          message: `Values deleted successfully`,
          success: true,
        });
      })
    );

    // get single
    app.get(
      '/api/single/:doctype',
      frappe.asyncHandler(async function (request, response) {
        let doc = await frappe.getSingle(request.params.doctype);
        return response.json({
          message: `${request.params.doctype} retrieved successfully`,
          success: true,
          data: doc.getValidDict(),
        });
      })
    );
    // Update single
    app.put(
      '/api/single/:doctype',
      frappe.asyncHandler(async function (request, response) {
        let data = request.body;
        let doc = await frappe.getSingle(request.params.doctype);
        Object.assign(doc, data);
        await doc.update();
        await frappe.db.commit();
        return response.json({
          message: `${request.params.doctype} Updated successfully`,
          success: true,
          data: doc.getValidDict(),
        });
      })
    );
  },
};
