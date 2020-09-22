const shellEncode = require("..");

var cmd = shellEncode("echo", ['Hello "World"!']);
console.log(cmd);

cmd = shellEncode("echo", ['Hello "World"!'], { shell: "cmd" });
console.log(cmd);

var cmd = shellEncode("cmd.run", ["./testscript2", ["arg1", "arg2"]]);
console.log(cmd);

var cmd = shellEncode(
    "powershell",
    ["Write-Output", ["Hello World!"], { shell: "powershell" }],
    { shell: "cmd" }
);
console.log(cmd);
