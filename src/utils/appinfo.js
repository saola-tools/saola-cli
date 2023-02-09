'use strict';

const appRootPath = require('app-root-path');
const fs = require('fs');
const path = require('path');
const lodash = require('lodash');
const logger = require('./logger.js');

// Program package information
let pkgProgram;

try {
  pkgProgram = JSON.parse(fs.readFileSync(path.join(appRootPath.toString(), 'package.json'), 'utf8'));
} catch(error) {
  logger.warn(' - Error on loading package.json information: %s', JSON.stringify(error));
}

const appinfo = lodash.pick(pkgProgram,
    ['version', 'name', 'description', 'homepage', 'author', 'contributors', 'license']);

// Commandline user-agent
appinfo.useragent = [appinfo.name, '/', appinfo.version].join('');

module.exports = appinfo;
