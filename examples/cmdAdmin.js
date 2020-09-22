const shellEncode = require("..");

// Running this command in CMD shows an admin powershell:
var cmd = shellEncode(
    "powershell",
    "-Command",
    [
        "Start-Process",
        "-Wait",
        "powershell",
        [
            "-ExecutionPolicy",
            "Bypass",
            "-NoProfile",
            "-Command",
            [
                "cmd",
                "/c",
                ["echo", ["im admin"], "&", "pause", { shell: "cmd" }],
            ],
            { expansion: true },
        ],
        "-Verb",
        "RunAs",
        { shell: "powershell" },
    ],
    { shell: "cmd" }
);
console.log(cmd);
// Output:
// powershell -Command "Start-Process -Wait powershell '-ExecutionPolicy Bypass -NoProfile -Command ""cmd /c ''echo `""im admin`"" & pause''""' -Verb RunAs"
