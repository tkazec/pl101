"use strict";

/*** setup ***/
var assert = require("assert");
var fs = require("fs");
var PEG = require("pegjs");

var data = fs.readFileSync(__dirname + "/grammar.peg", "utf-8");

var parse = PEG.buildParser(data).parse;


/*** helpers ***/
var testGrammar = function (src, out) {
	assert.deepEqual(parse(src), out);
};


/*** test ***/
describe("The grammar", function () {
	it("should parse atoms", function () {
		testGrammar("atom", "atom");
		testGrammar("+", "+");
	});
	
	it("should parse expressions", function () {
		testGrammar(
			"(+ x 3)",
			["+", "x", "3"]
		);
	});
	
	it("should parse nested expressions", function () {
		testGrammar(
			"(+ 1 (f x 3 y))",
			["+", "1", ["f", "x", "3", "y"]]
		);
	});
	
	it("should parse crazy stuff", function () {
		testGrammar(
			"(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1))))))",
			["define", "factorial", ["lambda", ["n"], ["if", ["=", "n", "0"], "1", ["*", "n", ["factorial", ["-", "n", "1"]]]]]]
		);
	});
	
	it("should allow any whitespace everywhere", function () {
		testGrammar(
			"\n(f (  x ) ( x * x  ) )\t",
			["f", ["x"], ["x", "*", "x"]]
		);
	});
	
	it("should ignore comments", function () {
		testGrammar(
			"(+;;test\n1 1)",
			["+", "1", "1"]
		);
	});
	
	it("should ease quoting", function () {
		testGrammar(
			"(a 'b '(c d) e)",
			["a", ["quote", "b"], ["quote", ["c", "d"]], "e"]
		);
	});
});