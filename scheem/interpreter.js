"use strict";

module.exports = function (expr, env) {
	var args = expr;
	
	var evl = function (expr) {
		return module.exports(expr, env);
	};
	
	var find = function (name, ctx) {
		ctx = ctx || env;
		return name in ctx.vars ? ctx.vars[name] : find(name, ctx.outer);
	};
	
	var update = function (name, val, ctx) {
		ctx = ctx || env;
		
		while (!(name in ctx.vars)) {
			ctx = ctx.outer;
		}
		
		return ctx.vars[name] = val;
	};
	
	switch (typeof expr) {
		case "number":
			return expr;
		case "string":
			return find(expr);
	}
	
	switch (expr = args.shift()) {
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
		
		case "def":
			return env.vars[args[0]] = evl(args[1]);
		case "set":
			return update(args[0], evl(args[1]));
		
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