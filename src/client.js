'use strict';

const Promise = require('bluebird');
const lodash = require('lodash');
const util = require('util');
const program = require('commander');
const DevebotApi = require('devebot-api');

const Config = require('../lib/utils/config');
const TextUI = require('../lib/utils/textui');
const Myperf = require('../lib/utils/myperf');
const logger = require('../lib/utils/logger');

const SPECIAL_ARGS = ['package', 'payload'];

module.exports = function(params = {}) {
  let adapter = params.adapter;
  let listener = params.listener;
  let tui;

  if (lodash.isObject(adapter)) {
    tui = new TextUI();
  } else {
    var cfgObj = new Config(params);
    var cfg = cfgObj.getConfig();
    adapter = new DevebotApi(lodash.extend(cfg, {
      logger: logger,
      ws: listener
    }));
    var mpfObj = new Myperf();
    tui = new TextUI({ config: cfgObj, myperf: mpfObj });
  }

  adapter.on('started', function() {
    logger.debug(' The command is started');
  });
  
  adapter.on('progress', function(data) {
    logger.debug(' The command is processing');
  });
  
  adapter.on('completed', function(data) {
    tui.displayCliOutput(data);
  });
  
  adapter.on('failed', function(data) {
    tui.displayCliOutput(data);
  });
  
  adapter.on('done', function() {
    logger.debug(' - The command is done');
  });
  
  adapter.on('noop', function() {
    logger.debug(' - The command not found');
  });

  adapter.on('close', function(code, message) {
    logger.debug(' - The connection is closed (%s). Message: %s', code, message);
  });
  
  adapter.on('error', function(error) {
    logger.debug(' - The connection has been broken - %s', error);
    tui.displayException(error);
  });

  var init = Promise.promisify(adapter.loadDefinition, { context: adapter });
  init().then(function(obj) {
    let clidef = obj && obj.payload || {};
    return Promise.resolve().then(function() {
      tui.displayCliHeader(clidef);
      return run(adapter, clidef);
    }).then(function() {
      tui.displayCliFooter(clidef);
    });
  }).catch(function(exception) {
    tui.displayException(exception);
  });
};

var run = function(adapter, clidef) {
  return Promise.promisify(function(callback) {
    clidef = clidef || {};
    logger.trace(' * cli definition: %s', JSON.stringify(clidef, null, 2));

    var commands = clidef.commands || [];

    for(var i=0; i<commands.length; i++) {
      var command = commands[i];
      var optionNames = [];

      var cmddef = program.command(command.name).description(command.description);
      
      if (command.package) {
        cmddef = cmddef.option('--package [string]', 'Package name');
        optionNames.push('package');
      }

      var options = command.options || [];
      for(var k=0; k<options.length; k++) {
        var option = options[k];
        cmddef = cmddef.option(util.format('-%s --%s %s', 
            option.abbr, option.name, option.required?'<value>':'[value]'), 
            option.description);
        optionNames.push(option.name);
      }

      if (lodash.isObject(command.schema)) {
        cmddef = cmddef.option('--payload [json]', 'Data (in JSON format)');
        optionNames.push('payload');
      }

      cmddef = cmddef.action((function(command, optionNames) {
        return function(values) {
          let cmdObject = {
            name: command.name,
            options: lodash.omit(lodash.pick(values, optionNames), SPECIAL_ARGS)
          };
          if (optionNames && optionNames.indexOf('package') >= 0) {
            cmdObject['package'] = values['package'];
          }
          if (optionNames && optionNames.indexOf('payload') >= 0) {
            cmdObject['payload'] = JSON.parse(values['payload']);
          }
          adapter.execCommand(cmdObject, callback);
        };
      })(command, optionNames));
    }
    
    program.parse(process.argv);
    
    if (process.argv.length <= 2) {
      program.outputHelp(function(helptext) {
        process.stdout.write(helptext);
        callback();
      });
    }
  })();
};
