"use strict";

var locate = function (ctx, name, val) {
	if (name in ctx.vars) {
		return arguments.length === 3 ? (ctx.vars[name] = val) : ctx.vars[name];
	} else if (ctx.outer) {
		return arguments.length === 3 ? locate(ctx.outer, name, val) : locate(ctx.outer, name);
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
			return env.vars[tree.name] = 0;
		case ":":
			return locate(env, tree.left, expr(env, tree.right));
		case "fun":
			env.vars[tree.name] = function () {
				var vars = {};
				var params = arguments;
				
				tree.args.forEach(function (name, i) {
					vars[name] = params[i];
				});
				
				return seq({ vars: vars, outer: env }, tree.body);
			};
			
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

module.exports = function (cvs) {
	this.cvs = cvs;
	this.ctx = cvs.getContext("2d");
	
	this.env = {
		vars: {
			forward: this.forward.bind(this),
			left: this.left.bind(this),
			right: this.right.bind(this)
		}
	};
	
	this.reset();
};

module.exports.prototype = {
	reset: function () {
		this.ctx.fillStyle = "#FFF";
		this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
		
		this.ctx.strokeStyle = "#0060FF";
		this.ctx.lineWidth = 2;
		
		this.x = this.cvs.width / 2;
		this.y = this.cvs.height / 2;
		this.angle = 0;
		this.ctx.moveTo(this.x, this.y);
	},
	forward: function (dist) {
		this.x += Math.cos(this.angle * (Math.PI / 180)) * dist;
		this.y += Math.sin(this.angle * (Math.PI / 180)) * dist;
		
		this.ctx.lineTo(this.x, this.y);
	},
	left: function (deg) {
		this.angle -= deg;
	},
	right: function (deg) {
		this.angle += deg;
	},
	eval: function (tree) {
		this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);
		
		seq(this.env, tree);
		
		this.ctx.stroke();
	}
};