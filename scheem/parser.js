"use strict";

var fs = require("fs");
var pegjs = require("pegjs");

var grammar = fs.readFileSync(__dirname + "/grammar.peg", "utf-8");

module.exports = pegjs.buildParser(grammar).parse;