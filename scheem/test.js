"use strict";

/*** setup ***/
var assert = require("assert");
var fs = require("fs");
var PEG = require("pegjs");

var data = fs.readFileSync(__dirname + "/grammar.peg", "utf-8");

var parse = PEG.buildParser(data).parse;
var interpret = require("./interpreter");


/*** helpers ***/
var testParse = function (src, out) {
	assert.deepEqual(parse(src), out);
};

var testEval = function (src, out, env) {
	assert.deepEqual(interpret(parse(src), env || {}), out);
};


/*** test ***/
describe("The grammar", function () {
	it("should parse atoms", function () {
		testParse("atom", "atom");
		testParse("+", "+");
	});
	
	it("should parse numeric atoms", function () {
		assert.strictEqual(parse("-90.01"), -90.01);
	});
	
	it("should parse expressions", function () {
		testParse(
			"(+ x 3)",
			["+", "x", 3]
		);
	});
	
	it("should parse nested expressions", function () {
		testParse(
			"(+ 1 (f x 3 y))",
			["+", 1, ["f", "x", 3, "y"]]
		);
	});
	
	it("should parse crazy stuff", function () {
		testParse(
			"(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1))))))",
			["define", "factorial", ["lambda", ["n"], ["if", ["=", "n", 0], 1, ["*", "n", ["factorial", ["-", "n", 1]]]]]]
		);
	});
	
	it("should allow any whitespace everywhere", function () {
		testParse(
			"\n(f (  x ) ( x * x  ) )\t",
			["f", ["x"], ["x", "*", "x"]]
		);
	});
	
	it("should ignore comments", function () {
		testParse(
			"(+;;test\n1 1)",
			["+", 1, 1]
		);
	});
	
	it("should ease quoting", function () {
		testParse(
			"(a 'b '(c d) e)",
			["a", ["quote", "b"], ["quote", ["c", "d"]], "e"]
		);
	});
});

describe("The interpreter", function () {
	it("should do math", function () {
		testEval(
			"(/ (- (* (+ 10 34) 3) 6) 3)",
			42
		);
	});
});