"use strict";

var lib = {
	forward: function (dist) {
		console.log("forward", dist);
	},
	left: function (angle) {
		console.log("left", angle);
	},
	right: function (angle) {
		console.log("right", angle);
	}
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

var expr = function (env, tree) {
	var evl = expr.bind(null, env);
	
	if (typeof tree === "number") {
		return tree;
	}
	
	switch (tree.tag) {
		case "+":
			return evl(tree.left) + evl(tree.right);
		case "-":
			return evl(tree.left) - evl(tree.right);
		case "*":
			return evl(tree.left) * evl(tree.right);
		case "/":
			return evl(tree.left) / evl(tree.right);
		
		case "=":
			return evl(tree.left) === evl(tree.right);
		case "!":
			return evl(tree.left) !== evl(tree.right);
		case "<":
			return evl(tree.left) < evl(tree.right);
		case ">":
			return evl(tree.left) > evl(tree.right);
		case "<=":
			return evl(tree.left) <= evl(tree.right);
		case ">=":
			return evl(tree.left) >= evl(tree.right);
		
		case "ident":
			return locate(env, tree.name);
		case "call":
			return locate(env, tree.name).apply(null, tree.args.map(evl));
	}
};

var stmt = function (env, tree) {
	switch (tree.tag) {
		case "ignore":
			return expr(env, tree.body);
		
		case "var":
			return locate(env, tree.name, 0);
		case ":":
			return locate(env, tree.left, expr(env, tree.right));
		case "fun":
			locate(env, tree.name, function () {
				var vars = {};
				var params = arguments;
				
				tree.args.forEach(function (name, i) {
					vars[name] = params[i];
				});
				
				return seq({ vars: vars, outer: env }, tree.body);
			});
			
			return null;
		
		case "if":
			var val = null;
			
			if (expr(env, tree.expr)) {
				val = seq(env, tree.body);
			}
			
			return val;
		case "repeat":
			var count = expr(env, tree.expr);
			var val = null;
			
			for (; count--;) {
				val = seq(env, tree.body);
			}
			
			return val;
	}
};

var seq = function (env, list) {
	return list.map(function (tree) {
		return stmt(env, tree);
	}).pop();
};

module.exports = function (tree, env) {
	return seq(env, tree);
};