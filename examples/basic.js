const { encode } = require('..');

var cmd = encode('echo', ['Hello "World"!']);
console.log(cmd);
