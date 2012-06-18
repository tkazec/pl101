"use strict";

module.exports = function (expr, env) {
	var evl = function (expr) {
		return module.exports(expr, env);
	};
	
	var locate = function (ctx, name, val) {
		if (name in ctx.vars) {
			return arguments.length === 3 ? (ctx.vars[name] = val) : ctx.vars[name];
		} else if (ctx.outer && arguments.length === 3) {
			return locate(ctx.outer, name, val);
		} else if (!ctx.lib && arguments.length === 2) {
			return locate(ctx.outer || { vars: lib, lib: true }, name);
		} else {
			throw new ReferenceError(name + " could not be located.");
		}
	};
	
	switch (typeof expr) {
		case "number":
			return expr;
		case "string":
			return locate(env, expr);
	}
	
	var args = expr.slice(1);
	
	switch (expr = expr[0]) {
		case "def":
			return env.vars[args[0]] = evl(args[1]);
		case "set":
			return locate(env, args[0], evl(args[1]));
		case "let":
			var vars = {};
			
			args[0].forEach(function (pair) {
				vars[pair[0]] = evl(pair[1]);
			});
			
			return module.exports(args[1], { vars: vars, outer: env });
		
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
	}
};