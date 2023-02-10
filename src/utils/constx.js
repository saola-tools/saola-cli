"use strict";

const fs = require("fs");
const path = require("path");

function loadPackage () {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "/../../package.json"), "utf8"));
}

function injectPackageInfo (CONSTANTS = {}) {
  const PKG_INFO = loadPackage();
  //
  Object.assign(CONSTANTS, {
    FRAMEWORK: {
      NAMESPACE: getFrameworkName(PKG_INFO.name),
      PACKAGE_NAME: PKG_INFO.name,
      VERSION: PKG_INFO.version,
    }
  });
  //
  return CONSTANTS;
}

function getFrameworkName (packageName) {
  const scopedNamePatterns = [
    /^@(?<scope>.+)\/(?<name>[a-zA-Z]{1}[a-zA-Z0-9-_]*)$/,
    /^(?<scope>[a-zA-Z]+)-(?<name>[a-zA-Z]{1}[a-zA-Z0-9-_]*)$/,
  ];
  for (let scopedNamePattern of scopedNamePatterns) {
    const match = packageName.match(scopedNamePattern);
    if (match && match.groups) {
      const scope = match.groups["scope"];
      if (isString(scope)) {
        return scope;
      }
    }
  }
  //
  return packageName;
}

function isString (s) {
  return typeof s === "string";
}

const CONSTANTS = {
  argumentSchema: {
    "type": "object",
    "oneOf": [{
      "properties": {
        "state": {
          "type": "string",
          "enum": ["completed", "failed"]
        },
        "message": {
          "type": "string"
        },
        "payload": {
          "type": "array",
          "items": {
            "oneOf": [{
              "properties": {
                "type": {
                  "type": "string",
                  "enum": ["json"]
                },
                "title": {
                  "type": "string"
                },
                "data": {
                  "type": ["boolean", "number", "string", "array", "object"]
                }
              },
              "required": ["type", "data"]
            }, {
              "properties": {
                "type": {
                  "type": "string",
                  "enum": ["record", "object"]
                },
                "title": {
                  "type": "string"
                },
                "label": {
                  "type": "object"
                },
                "data": {
                  "type": "object"
                }
              },
              "required": ["type", "label", "data"]
            }, {
              "properties": {
                "type": {
                  "type": "string",
                  "enum": ["table", "grid"]
                },
                "title": {
                  "type": "string"
                },
                "label": {
                  "type": "object"
                },
                "data": {
                  "type": "array",
                  "minItems": 1,
                  "items": {
                    "type": "object"
                  }
                }
              },
              "required": ["type", "label", "data"]
            }]
          }
        }
      }
    }]
  }
};

module.exports = injectPackageInfo(CONSTANTS);
