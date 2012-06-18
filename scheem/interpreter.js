"use strict";

module.exports = function (expr, env) {
	var args = expr;
	
	var evl = function (expr) {
		return module.exports(expr, env);
	};
	
	var find = function (name, ctx) {
		ctx = ctx || env;
		return name in ctx.vars ? ctx.vars[name] : find(name, ctx.outer || { vars: lib });
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
		case "def":
			return env.vars[args[0]] = evl(args[1]);
		case "set":
			return update(args[0], evl(args[1]));
		
		case "quote":
			return args[0];
		case "lambda":
			return function () {
				var vars = {};
				var params = arguments;
				
				args[0].forEach(function (name, i) {
					vars[name] = params[i];
				});
				
				return module.exports(args[1], { vars: vars, outer: env });
			};
		
		case "if":
			return evl(args[0]) ? evl(args[1]) : evl(args[2]);
		
		case "seq":
			return args.map(evl).pop();
		
		default:
			return evl(expr).apply(null, args.map(evl));
	}
};

var lib = {
	"+": function (a, b) {
		return a + b;
	},
	"-": function (a, b) {
		return a - b;
	},
	"*": function (a, b) {
		return a * b;
	},
	"/": function (a, b) {
		return a / b;
	},
	
	"=": function (a, b) {
		return a === b;
	},
	"<": function (a, b) {
		return a < b;
	},
	">": function (a, b) {
		return a > b;
	},
	
	"cons": function (el, arr) {
		arr.unshift(el);
		return arr;
	},
	"car": function (arr) {
		return arr[0];
	},
	"cdr": function (arr) {
		return arr.slice(1);
	},
	
	"log": function () {
		console.log.apply(console, arguments);
	},
};