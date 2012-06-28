Files for Nathan's University PL101. Finished 2012-06-28.

---

**mus/**  
A simple MUS -> NOTE compiler for lesson 2. Loaded as a Node module; also contains an extremely simple test and a "rest" tag.

**scheem/**  
A simple Lisp based on Scheme, for lessons 3-5. To correct inconsistencies and other silly stuff, I deviated slightly from the "official" Scheem syntax and behavior defined in the lessons. Comes with a grammar, grammar bootstrap (aka parser), interpreter, and plentiful tests. Runs on Node and requires PEG.js for the parser and Mocha for the tests. Overall I'm extremely happy with the result, especially the interpreter :)

**tortoise/**  
Turtle graphics, in a custom C-style language, for lesson 6. Deviates slightly from the provided syntax, and writes to a file instead of using a web interface. Comes with a grammar, interpreter, rasterizer, and some tests. Requires PEG.js, Mocha, and node-canvas. Not as refined as Scheem, but it turned out okay.

---

Written and freed into the [public domain](http://creativecommons.org/publicdomain/zero/1.0/) by [Teddy Cross](http://tkaz.ec).