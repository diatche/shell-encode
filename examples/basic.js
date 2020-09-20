const shellEncode = require('..');

var cmd = shellEncode('echo', ['Hello "World"!']);
console.log(cmd);

shellEncode.setDefaultShell('cmd');
cmd = shellEncode('echo', ['Hello "World"!']);
console.log(cmd);
