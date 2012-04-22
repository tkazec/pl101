module.exports = function compile (musexpr, time) {
	var root = time === undefined,
		left, right;
	
	time = time || 0;
	
	if (musexpr.tag === "note") {
		musexpr.start = time;
		
		return (root ? [] : [musexpr.dur]).concat(musexpr);
	} else if (musexpr.tag === "seq") {
		left = compile(musexpr.left, time);
		time += left.shift();
		
		right = compile(musexpr.right, time);
		time += right.shift();
	} else if (musexpr.tag === "par") {
		left = compile(musexpr.left, time);
		right = compile(musexpr.right, time);
		
		time += Math.max(left.shift(), right.shift());
	}
	
	return (root ? [] : [time]).concat(left, right);
};