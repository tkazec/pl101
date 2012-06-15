"use strict";

module.exports = function interpret (expr, env) {
	switch (typeof expr) {
		case "number":
			return expr;
		case "string":
			return env[expr];
	}
	
	var fn = expr.shift();
	var args = expr;
	
	var evl = function (expr) {
		return interpret(expr, env);
	};
	
	switch (fn) {
		case "+":
			return evl(args[0]) + evl(args[1]);
		case "-":
			return evl(args[0]) - evl(args[1]);
		case "*":
			return evl(args[0]) * evl(args[1]);
		case "/":
			return evl(args[0]) / evl(args[1]);
		
		case "=":
			return evl(args[0]) === evl(args[1]);
		case "<":
			return evl(args[0]) < evl(args[1]);
		case ">":
			return evl(args[0]) > evl(args[1]);
		case "if":
			return evl(args[0]) ? evl(args[1]) : evl(args[2]);
		
		case "set":
			env[args[0]] = evl(args[1]);
			return;
		case "quote":
			return args[0];
		
		case "cons":
			var arr = evl(args[1]);
			arr.unshift(evl(args[0]));
			return arr;
		case "car":
			return evl(args[0])[0];
		case "cdr":
			return evl(args[0]).slice(1);
		
		case "go":
			return args.map(evl).pop();
		
		case "log":
			console.log(args.map(evl));
			return;
	}
};