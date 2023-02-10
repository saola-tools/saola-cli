'use strict';

const lodash = require('lodash');
const debugx = require('debug')('tdd:framework:cli:textui');
const assert = require('chai').assert;
const TextUI = require('../../lib/utils/textui');
const stdInterceptor = require('../lib/std-interceptor');

describe('tdd:framework:cli:textui:displayCliOutput', function() {
  var textui = new TextUI({
    options: {
      colorEnabled: false
    }
  });

  it('Render Table output data type', function() {
    var unhook = stdInterceptor({trim:false});
    textui.displayCliOutput({
      state: 'completed',
      payload: [
        {
          "title": "Grid data format Example",
          "type": "grid",
          "label": {
            "objValue": "Value",
            "intValue": "Integer",
            "boolValue": "Boolean"
          },
          "data": [{
            "objValue": {
              "greeting": "Hello world",
              "PI": 3.14159
            },
            "intValue": 1024,
            "boolValue": true
          }]
        }
      ]
    });
    var output = unhook();
    var expected = [
      "\n",
      "[v] Grid data format Example\n",
      [
      "┌───────────┬─────────┬─────────┐\n",
      "│ Value     │ Integer │ Boolean │\n",
      "├───────────┼─────────┼─────────┤\n",
      "│ [object … │ 1024    │ true    │\n",
      "└───────────┴─────────┴─────────┘\n"
      ].join("")
    ]
    false && console.info(JSON.stringify(output.stdout, null, 0));
    assert.sameOrderedMembers(output.stdout, expected)
  });

  it('Render JSON output data type', function() {
    var unhook = stdInterceptor({trim:false});
    textui.displayCliOutput({
      state: 'failed',
      payload: [
        {
          "title": "Sequence descriptors",
          "type": "json",
          "data": {
            "objValue": {
              "greeting": "Hello world",
              "PI": 3.14159
            },
            "intValue": 1024,
            "boolValue": true
          }
        }
      ]
    });
    var output = unhook();
    var expected = [
      '\n',
      '[x] Sequence descriptors\n',
      '┌──────────────────────────────────────────────────────────────────────────────┐\n' +
      '│ JSON                                                                         │\n' +
      '├──────────────────────────────────────────────────────────────────────────────┤\n' +
      '│ {                                                                            │\n' +
      '│   "objValue": {                                                              │\n' +
      '│     "greeting": "Hello world",                                               │\n' +
      '│     "PI": 3.14159                                                            │\n' +
      '│   },                                                                         │\n' +
      '│   "intValue": 1024,                                                          │\n' +
      '│   "boolValue": true                                                          │\n' +
      '│ }                                                                            │\n' +
      '└──────────────────────────────────────────────────────────────────────────────┘\n'
    ]
    assert.sameOrderedMembers(output.stdout, expected)
  });
});
