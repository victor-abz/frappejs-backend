const fs = require('fs');
const { getAppConfig } = require('../webpack/utils');
const appConfig = getAppConfig();
const logger = require('../webpack/logger');

module.exports = {
  make_model_files(name) {
    const baseDir = appConfig.baseDir ? `${appConfig.baseDir}` : '.';
    const exportString = appConfig.useEs6
      ? 'export default {'
      : 'module.exports = {';

    const importString = appConfig.useEs6
      ? `import ${name} from './doctype/${name}/${name}.js'`
      : `${name}: require('./doctype/${name}/${name}.js'),`;

    //  Check if file `./models/doctype/${name}/${name}.js`  exists and return
    if (fs.existsSync(`${baseDir}/models/doctype/${name}/${name}.js`)) return;
    // check if models folder exist, if not create it and add an index file with empty module exports
    if (!fs.existsSync(`${baseDir}/models`)) {
      fs.mkdirSync(`${baseDir}/models`);
      fs.writeFileSync(
        `${baseDir}/models/index.js`,
        `module.exports = {
	  };`
      );
    }
    // Create DOctype Folder
    fs.mkdirSync(
      `${baseDir}/models/doctype/${name}`,
      { recursive: true },
      (err) => console.log(err)
    );
    fs.writeFileSync(
      `${baseDir}/models/doctype/${name}/${name}.js`,
      `${exportString} 
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
    fs.readFile(`${baseDir}/models/index.js`, 'utf8', (err, data) => {
      if (err) throw err;

      // If not use Es6
      if (!appConfig.useEs6) {
        if (data.includes(importString)) return;
        const result = data.replace(
          'module.exports = {',
          `module.exports = {
${name}: require('./doctype/${name}/${name}.js'),`
        );

        fs.writeFile(`${baseDir}/models/index.js`, result, 'utf8', (err) => {
          if (err) console.log(err);
          success = logger('Creating Models:', 'green');
          success(
            `Rura model files created in ${baseDir}/models/doctype/${name}/${name}.js!`
          );
        });
      } else {
        //   Import the model in the index.js file using ES6 syntax and export it
        //   Example of the file:
        //   import ${name} from './doctype/${name}/${name}.js';
        //   export default {
        // 		${name},
        // };
        if (data.includes(importString)) return;
        const result = data.replace(
          'export default {',
          `import ${name} from './doctype/${name}/${name}.js';
			
export default {
	${name},`
        );

        fs.writeFile(`${baseDir}/models/index.js`, result, 'utf8', (err) => {
          if (err) console.log(err);
          success = logger('Creating Models:', 'green');
          success(
            `Rura model files created in ${baseDir}/models/doctype/${name}/${name}.js!`
          );
        });
      }
    });
  },
};
