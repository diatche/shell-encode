const shellEncode = require('..');

var cmd = shellEncode('echo', ['Hello "World"!']);
console.log(cmd);

shellEncode.setDefaults('cmd');
cmd = shellEncode('echo', ['Hello "World"!']);
console.log(cmd);
