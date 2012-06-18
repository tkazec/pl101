"use strict";

/*** setup ***/
var assert = require("assert");

var parse = require("./parser");
var interpret = require("./interpreter");


/*** helpers ***/
var testParse = function (src, out) {
	assert.deepEqual(parse(src), out);
};

var testEval = function (src, out, env) {
	assert.deepEqual(interpret(parse(src), env || { vars: {} }), out);
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
		
		testParse(
			"0;;test",
			0
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
	it("should handle using code as data", function () {
		testEval(
			"'(1 2 3 (4 5 6) 7 8 9)",
			[1, 2, 3, [4, 5, 6], 7, 8, 9]
		);
	});
	
	it("should do math", function () {
		testEval(
			"(/ (- (* (+ 10 34) 3) 6) 3)",
			42
		);
	});
	
	it("should compare stuff", function () {
		testEval(
			"(< 5 10)",
			true
		);
		
		testEval(
			"(> 461789 527403)",
			false
		);
		
		testEval(
			"(= 'aaaa 'aaaa)",
			true
		);
		
		testEval(
			"(= 'aaaa 'aaab)",
			false
		);
	});
	
	it("should retrieve variables", function () {
		testEval(
			"(/ 5 x)",
			0.5,
			{ vars: { x: 10 } }
		);
	});
	
	it("should set and update variables", function () {
		var env = { vars: {} };
		
		interpret(parse("(def x 2)"), env);
		interpret(parse("(set x 42)"), env);
		interpret(parse("(def y 8)"), env);
		
		testEval(
			"(+ x y)",
			50,
			env
		);
	});
	
	it("should let us have closure", function () {
		testEval(
			"(let ((x 2) (y 5)) (+ x y))",
			7
		);
		
		testEval(
			"(let ((x 'a) (y 2)) (let ((x 3)) (* x y)))",
			6
		);
	});
	
	it("should have a flow", function () {
		testEval(
			"(seq (def z 10) (def x 5) (def y (+ x z)) (set x (* y x)) (* x z))",
			750
		);
	});
	
	it("should use conditioner", function () {
		testEval(
			"(if (= 1 1) (if (= 2 3) 10 11) 12)",
			11
		);
		
		testEval(
			"(if (> 1 (< 10 5)) 3 error)",
			3
		);
	});
	
	it("should have a lisp", function () {
		testEval(
			"(seq (def x (car '((1 2 3) 4 5 6))) (def y (cdr x)) (cons 3 y))",
			[3, 2, 3]
		);
	});
	
	it("should love lambs", function () {
		testEval(
			"((lambda (x) (+ x 1)) 5)",
			6
		);
		
		testEval(
			"(((lambda (x) (lambda (y) (+ x y))) 5) 3)",
			8
		);
		
		testEval(
			"(((lambda (x) (lambda (x) (+ x x))) 5) 3)",
			6
		);
	});
	
	it("should recurse", function () {
		testEval(
			"(seq (def down (lambda (n) (if (> n 0) (down (- n 1)) 0))) (down 5))",
			0
		);
		
		testEval(
			"(seq (def factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 5))",
			120
		);
		
		testEval(
			"(seq (def make-account (lambda (balance) (lambda (amt) (set balance (+ balance amt))))) (def a (make-account 100)) (a -20))",
			80
		);
	});
});