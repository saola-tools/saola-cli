"use strict";

const util = require("util");

function Perf () {
  this.hrstart = process.hrtime();
}

Perf.prototype.stop = function() {
  const hrsum = process.hrtime(this.hrstart);
  const memoryUsage = process.memoryUsage().rss;
  return {
    time_usage: hrsum,
    time_text: util.format("%ds %dms", hrsum[0], hrsum[1]/1000000),
    memoryUsage: memoryUsage,
    memory_text: util.format("%d(MB)", Math.round(memoryUsage/1024/1024))
  };
};

module.exports = Perf;
