#!/usr/bin/env node

const program = require('commander');
const process = require('process');
const package = require('./package.json');
const boilerplate = require('frappe-backend/model/boilerplate');

program.description('Frappe Backend CLI');
program.name('frp-cmd');
program.usage('<command>');
program.version(package.version);

program
  .command('start [mode]')
  .description('Start development server')
  .action(require('./webpack/start'));

// create  new command new-model with mandatory argument modelName. The command should also take two options, folderName and useEs6.
// Should call action function with the modelName and the options.
// The action function should call the make_model_files function with the modelName and the options.
program
  .command('new-model <modelName>')
  //   .option('-b, --baseDir <baseDir>', 'Base Directory')
  //   .option('-e, --useEs6', 'Should Generate ES6 models')
  .action((modelName, options) => {
    console.log(modelName);
    boilerplate.make_model_files(modelName);
  });

program.parse(process.argv);
