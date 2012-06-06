"use strict";

/*** setup ***/
var assert = require("assert");
var fs = require("fs");
var PEG = require("pegjs");

var data = fs.readFileSync(__dirname + "/grammar.peg", "utf-8");

var parse = PEG.buildParser(data).parse;


/*** test ***/
describe("Scheem", function () {
	it("should parse atoms", function () {
		assert.deepEqual(parse("atom"), "atom");
		assert.deepEqual(parse("+"), "+");
	});
	
	it("should parse expressions", function () {
		assert.deepEqual(parse("(+ x 3)"), ["+", "x", "3"]);
	});
	
	it("should parse nested expressions", function () {
		assert.deepEqual(parse("(+ 1 (f x 3 y))"), ["+", "1", ["f", "x", "3", "y"]]);
	});
	
	it("should parse crazy stuff", function () {
		assert.deepEqual(
			parse("(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1))))))"),
			["define", "factorial", ["lambda", ["n"], ["if", ["=", "n", "0"], "1", ["*", "n", ["factorial", ["-", "n", "1"]]]]]]
		);
	});
});