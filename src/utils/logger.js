"use strict";

const winston = require("winston");

const DEBUG = process.env.NODE_DEVEBOT_DEBUG || process.env.NODE_DEBUG || "error";

const acegikLevels = {
  levels: {
    debug: 4,
    info: 3,
    trace: 2,
    warn: 1,
    error: 0
  },
  colors: {
    debug: "blue",
    info: "green",
    trace: "yellow",
    warn: "cyan",
    error: "red"
  }
};

const logger = new(winston.Logger)({
    levels: acegikLevels.levels,
    colors: acegikLevels.colors,
    transports: [
        new(winston.transports.Console)({
            json: false,
            timestamp: true,
            colorize: true,
            level: DEBUG
        })
    ],
    exceptionHandlers: [
        new(winston.transports.Console)({
            json: false,
            timestamp: true,
            colorize: true,
            level: DEBUG
        })
    ],
    exitOnError: false
});

module.exports = logger;
