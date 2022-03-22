const fs = require('fs');

module.exports = {
  make_model_files(name) {
    // check if models folder exist, if not create it and add an index file with empty module exports
    if (!fs.existsSync('./models')) {
      fs.mkdirSync('./models');
      fs.writeFileSync(
        './models/index.js',
        `module.exports = {
	  };`
      );
    }
    // Create DOctype Folder
    fs.mkdirSync(`./models/doctype/${name}`, { recursive: true }, (err) =>
      console.log(err)
    );
    fs.writeFileSync(
      `./models/doctype/${name}/${name}.js`,
      `module.exports = {
    name: "${name}",
    label: "${name}",
    naming: "name", // {random|autoincrement}
    isSingle: 0,
    isChild: 0,
    isSubmittable: 0,
    settings: null,
    keywordFields: [],
    fields: [
        {
            fieldname: "name",
            label: "Name",
            fieldtype: "Data",
            required: 1
        }
    ]
}`
    );

    // append  require(`./models/doctype/${name}/${name}.js`) to models/index.js in the export section
    //  Example of the file:
    //  module.exports = {
    // 		${name}: require('./doctype/${name}/${name}.js'),
    // };.
    fs.readFile('./models/index.js', 'utf8', (err, data) => {
      if (err) throw err;
      const result = data.replace(
        /module.exports = {/,
        `module.exports = {
	${name}: require('./doctype/${name}/${name}.js'),`
      );
      fs.writeFile('./models/index.js', result, 'utf8', (err) => {
        if (err) throw err;
        console.log(`${name} model files created!`);
      });
    });
  },
};
