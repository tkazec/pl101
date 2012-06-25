"use strict";

var fs = require("fs");
var pegjs = require("pegjs");
var Canvas = require("canvas");

var grammar = fs.readFileSync(__dirname + "/grammar.peg", "utf-8");
var parse = pegjs.buildParser(grammar).parse;
var Interpreter = require("./interpreter");

if (require.main === module) {
	var stuff = parse(
		"fun curve(size, angle, scale, count) { if (count > 0) { forward(size); left(angle); curve(size * scale, angle, scale, count - 1); right(90); curve(size * scale * scale, angle, scale, count - 1); left(90); right(angle); right(180); forward(size); left(180); } } right(90); forward(100); right(180); curve(100, 29, 0.80, 10);"
	);
	
	var cvs = new Canvas(600, 600);
	var stack = new Interpreter(cvs);
	
	stack.eval(stuff);
	
	fs.writeFileSync(__dirname + "/test.png", stack.cvs.toBuffer());
}