"use strict";

const lodash = require("lodash");
const util = require("util");
const Table = require("cli-table");
const Validator = require("jsonschema").Validator;
const validator = new Validator();

const clientInfo = require("./appinfo.js");
const constx = require("./constx.js");

function TextUI (params) {
  params = params || {};

  const tableOpts = {
    style: {
        head: []    //disable colors in header cells
      , border: []  //disable colors for the border
    }
  };

  this.displayCliHeader = function(clidef) {
    clidef = clidef || {};
    const serverInfo = clidef.appinfo;
    console.info("Client[%s]: %s (v%s)", clientInfo.name, clientInfo.description, clientInfo.version);
    if (lodash.isObject(serverInfo) && serverInfo.name != clientInfo.name) {
      console.info("Server[%s]: %s (v%s)", serverInfo.name, serverInfo.description, serverInfo.version);
    }
  };

  this.displayCliFooter = function(clidef) {
    const cfgObj = params.config;
    const mpfObj = params.myperf;

    const status = [];

    if (lodash.isObject(cfgObj)) {
      const ctx = cfgObj.getContext();
      status.push(lodash.isEmpty(ctx) ? "default" : ctx);
      const cfg = cfgObj.getConfig();
      if (lodash.isObject(cfg)) {
        status.push(util.format(" - %s://%s:%s%s",
          cfg.protocol || "http", cfg.host, cfg.port, cfg.path));
      }
    }

    if (lodash.isObject(mpfObj)) {
      const usage = mpfObj.stop();
      status.push("\n", util.format("Time: %s - Memory: %s", usage.time_text, usage.memory_text));
    }

    [
      "",
      "------------------------------------------------------------------------------------",
      status.join(""),
      "",
    ].forEach(function(str) { console.info(str); });
  };

  this.displayCliOutput = function(output) {
    output = output || {};
    const valresult = validator.validate(output, constx.argumentSchema);
    if (valresult.errors.length > 0) {
      console.log(JSON.stringify(valresult.errors, null, 2));
      renderInvalid(output);
    } else {
      const options = {};
      options.isError = (output.state == "failed");
      let info = output.payload || [];
      if (!lodash.isArray(info)) info = [info];
      info.forEach(function(infoItem) {
        renderBlock(infoItem, options);
      });
    }
  };

  const renderInvalid = function(result) {
    const table = new Table(lodash.assign(tableOpts, {
      head: ["Invalid output format. Render full result object in JSON format"],
      colWidths: [78]
    }));
    table.push([JSON.stringify(result, null, 2)]);

    console.info("");
    console.info(table.toString());
  };

  const renderBlock = function(result, options) {
    printTitle(result, options);

    switch (result.type) {
      case "record":
      case "object":
        renderRecord(result);
        break;
      case "table":
      case "grid":
        renderTable(result);
        break;
      case "json":
        renderJson(result);
        break;
      default:
        renderUnknown(result);
        break;
    }
  };

  const renderRecord = function(result) {
    const label = result.label;
    const data = result.data;
    const keys = Object.keys(data);
    const rows = [];
    keys.forEach(function(key) {
      if (label[key]){
        const row = {};
        row[label[key]] = data[key];
        rows.push(row);
      }
    });

    const table = new Table(lodash.assign(tableOpts, {}));
    rows.forEach(function(row) {
      table.push(row);
    });

    console.info(table.toString());
  };

  const renderTable = function(result) {
    const label = result.label;
    const fields = Object.keys(label);

    const titles = [];
    fields.forEach(function(field) {
      titles.push(label[field]);
    });

    const data = result.data;
    const rows = [];
    data.forEach(function(object) {
      const row = [];
      for (let i=0; i<fields.length; i++) {
        row.push(object[fields[i]]);
      }
      rows.push(row);
    });

    const table = new Table(lodash.assign(tableOpts, {
      head: titles
    }));

    rows.forEach(function(row) {
      table.push(row);
    });

    console.info(table.toString());
  };

  const renderJson = function(result) {
    const table = new Table(lodash.assign(tableOpts, {
      head: ["JSON"],
      colWidths: [78]
    }));
    table.push([JSON.stringify(result.data, null, 2)]);
    console.info(table.toString());
  };

  const renderUnknown = function(result) {
    const table = new Table(lodash.assign(tableOpts, {
      head: ["Unknown result type"],
      colWidths: [78]
    }));
    table.push([JSON.stringify(result.data, null, 2)]);
    console.info(table.toString());
  };

  const printTitle = function(result, options) {
    if (lodash.isString(result.title)) {
      console.info("");
      const sign = (options && options.isError) ? "[x]" : "[v]";
      console.info("%s %s", sign, result.title);
    }
  };

  this.displayException = function(exception) {
    [
      "",
      "Command has been broken - " + exception,
      "------------------------------------------------------------------------------------",
      "For more information about using this application, please see the guide:",
      "" + clientInfo.homepage,
      "",
    ].forEach(function(str) { console.info(str); });
  };
}

module.exports = TextUI;
