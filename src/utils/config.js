"use strict";

const fs = require("fs");
const path = require("path");
const lodash = require("lodash");
const userhome = require("userhome");

function HomeConfig (params) {
  params = params || {};

  const environmentVar = params.environmentVar || "NODE_DEVEBOT_CLI";
  const configContext = process.env[environmentVar];
  const configSubdir = params.configSubdir || ".devebot";
  const configFilename = params.configFilename || "config";
  const defaultConfig = lodash.merge({
    protocol: "http",
    host: "0.0.0.0",
    port: 17779,
    path: "/-",
    authen: {
      token_key: "devebot",
      token_secret: "s3cr3tpa$$w0rd"
    },
    tunnel: {
      enabled: false,
      rejectUnauthorized: false
    }
  }, params.defaultConfig);

  const self = this;

  const configDir = userhome(configSubdir);
  try {
    fs.readdirSync(configDir);
  } catch (err) {
    if (err.code == "ENOENT") {
      fs.mkdirSync(configDir);
    }
  }

  const readConfigFile = function(defaultConfig, configDir, context) {
    let configData = defaultConfig;

    const filenameParts = [configFilename];
    if (lodash.isString(context) && context.length > 0) {
      filenameParts.push(".", context);
    }
    filenameParts.push(".json");
    const configFile = path.join(configDir, filenameParts.join(""));

    try {
      configData = JSON.parse(fs.readFileSync(configFile, "utf8"));
    } catch (err) {
      if (err.code == "ENOENT") {
        if (params.configFileInitialized) {
          fs.writeFileSync(configFile, JSON.stringify(configData, null, 2), "utf8");
        }
      }
    }
    return configData;
  };

  let configObj = readConfigFile(defaultConfig, configDir);

  self.getContext = function() {
    return configContext;
  };

  self.getConfig = function() {
    if (lodash.isString(configContext) && !lodash.isEmpty(configContext)) {
      self.loadConfig(configContext);
    }
    return lodash.clone(configObj, true);
  };

  self.loadConfig = function(context) {
    if (!lodash.isString(context)) return;
    configObj = lodash.defaultsDeep(readConfigFile({}, configDir, context), configObj);
  };

  self.saveConfig = function(context, customCfg) {
    if (!lodash.isString(context) || context.length == 0) return;
    const customFile = path.join(configDir, "config." + context + ".json");

    if (!lodash.isObject(customCfg)) return;
    configObj = lodash.defaultsDeep(customCfg, configObj);

    fs.writeFileSync(customFile, JSON.stringify(configObj, null, 2), "utf8");
  };
}

module.exports = HomeConfig;
