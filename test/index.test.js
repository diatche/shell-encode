require("assert");
require("should");
const shellEncode = require("..");

describe("shellEncode", function () {
    describe("bash shell", function () {
        describe("without expansion", function () {
            let opts = {
                shell: "bash",
                expansion: false,
            };

            describe("strings as arguments", function () {
                it("should return the same strings joined with a space", function () {
                    shellEncode("echo", "1", opts).should.equal("echo 1");
                });
            });

            describe("string with quotes as arguments", function () {
                it("should not escape quotes", function () {
                    shellEncode('"foo"', opts).should.equal('"foo"');
                });
            });

            describe("string in an array", function () {
                it("should return the same string joined with a space and enclosed with quotes", function () {
                    shellEncode("bash", "-c", ["echo", "1"], opts).should.equal(
                        "bash -c 'echo 1'"
                    );
                });
            });

            describe("string with quotes in an array", function () {
                it("should escape quotes", function () {
                    shellEncode(["foo", '"bar wat"'], opts).should.equal(
                        "'foo \"bar wat\"'"
                    );
                });
            });
        });

        describe("with expansion", function () {
            let opts = {
                shell: "bash",
                expansion: true,
            };

            describe("strings as arguments", function () {
                it("should return the same strings joined with a space", function () {
                    shellEncode("echo", "$(pwd)", opts).should.equal(
                        "echo $(pwd)"
                    );
                });
            });

            describe("string with quotes as arguments", function () {
                it("should not escape quotes", function () {
                    shellEncode('"foo"', opts).should.equal('"foo"');
                });
            });

            describe("string in an array", function () {
                it("should return the same string joined with a space and enclosed with quotes", function () {
                    shellEncode(
                        "bash",
                        "-c",
                        ["echo", "$(pwd)"],
                        opts
                    ).should.equal('bash -c "echo $(pwd)"');
                });
            });

            describe("string with quotes in an array", function () {
                it("should escape quotes", function () {
                    shellEncode(["foo", '"bar wat"'], opts).should.equal(
                        '"foo \\"bar wat\\""'
                    );
                });
            });

            describe("single nested array", function () {
                it("should escape quotes", function () {
                    shellEncode(["foo", ["bar", "wat"]], opts).should.equal(
                        '"foo \\"bar wat\\""'
                    );
                });
            });

            describe("mixed strings and array arguments", function () {
                it("should enclose only array arguments", function () {
                    shellEncode("foo", ["bar", "wat"], opts).should.equal(
                        'foo "bar wat"'
                    );
                });
            });

            describe("single nested array with quotes", function () {
                it("should escape quotes", function () {
                    shellEncode(["foo", ['bar "wat"']], opts).should.equal(
                        '"foo \\"bar \\\\\\"wat\\\\\\"\\""'
                    );
                });
            });

            describe("double nested arrays", function () {
                it("should escape quotes", function () {
                    shellEncode(["foo", ["bar", ["wat"]]], opts).should.equal(
                        '"foo \\"bar \\\\\\"wat\\\\\\"\\""'
                    );
                });
            });

            describe("triple nested arrays", function () {
                it("should escape quotes", function () {
                    shellEncode(
                        ["one", ["two", ["three", ["four"]]]],
                        opts
                    ).should.equal(
                        '"one \\"two \\\\\\"three \\\\\\\\\\\\\\"four\\\\\\\\\\\\\\"\\\\\\"\\""'
                    );
                });
            });

            describe("double nested arrays with quotes", function () {
                it("should escape quotes", function () {
                    shellEncode(
                        ["one", ["two", ['three "four"']]],
                        opts
                    ).should.equal(
                        '"one \\"two \\\\\\"three \\\\\\\\\\\\\\"four\\\\\\\\\\\\\\"\\\\\\"\\""'
                    );
                });
            });
        });
    });

    describe("cmd shell", function () {
        describe("with expansion", function () {
            let opts = {
                shell: "cmd",
                expansion: true,
            };

            describe("strings as arguments", function () {
                it("should return the same strings joined with a space", function () {
                    shellEncode("foo", "bar", opts).should.equal("foo bar");
                });
            });

            describe("string in an array", function () {
                it("should return the same string joined with a space and enclosed with quotes", function () {
                    shellEncode(["foo", "bar"], opts).should.equal('foo^ bar');
                });
            });

            describe("mixed strings and array arguments", function () {
                it("should enclose only array arguments", function () {
                    shellEncode("foo", ["bar", "wat"], opts).should.equal(
                        'foo bar^ wat'
                    );
                });
            });

            describe("single nested array", function () {
                it("should escape quotes", function () {
                    shellEncode(["foo", ["bar", "wat"]], opts).should.equal(
                        'foo^ bar^^^ wat'
                    );
                });
            });

            describe("double nested arrays", function () {
                it("should escape quotes", function () {
                    shellEncode(["foo", ["bar", ["wat"]]], opts).should.equal(
                        'foo^^ bar^^^ wat'
                    );
                });
            });
        });
    });

    describe("powershell shell", function () {
        describe("with expansion", function () {
            let opts = {
                shell: "powershell",
                expansion: true,
            };

            describe("strings as arguments", function () {
                it("should return the same strings joined with a space", function () {
                    shellEncode("foo", "bar", opts).should.equal("foo bar");
                });
            });

            describe("string in an array", function () {
                it("should return the same string joined with a space and enclosed with quotes", function () {
                    shellEncode(["foo", "bar"], opts).should.equal('"foo bar"');
                });
            });

            describe("mixed strings and array arguments", function () {
                it("should enclose only array arguments", function () {
                    shellEncode("foo", ["bar", "wat"], opts).should.equal(
                        'foo "bar wat"'
                    );
                });
            });

            describe("single nested array", function () {
                it("should escape quotes", function () {
                    shellEncode(["foo", ["bar", "wat"]], opts).should.equal(
                        '"foo `"bar wat`""'
                    );
                });
            });

            describe("double nested arrays", function () {
                it("should escape quotes", function () {
                    shellEncode(["foo", ["bar", ["wat"]]], opts).should.equal(
                        '"foo `"bar \\`"wat\\`"`""'
                    );
                });

                it("should escape quotes and make replacements", function () {
                    shellEncode(
                        "powershell",
                        "-Command",
                        ["echo", ["1 2 3"], ";", "echo", ["4 5 6"]],
                        opts
                    ).should.equal('powershell -Command "echo \`"1 2 3\`" ; echo \`"4 5 6\`""');
                });
            });
        });
    });

    describe("mixed shell", function () {
        describe("cmd to powershell", function () {
            let cmdOpts = {
                shell: "cmd",
                expansion: false,
            };
            let powershellOpts = {
                shell: "powershell",
                expansion: true,
            };

            it("should escape quotes", function () {
                let psCmd = shellEncode(
                    "Write-Output",
                    ["Hello World!"],
                    powershellOpts
                );
                shellEncode("powershell", [psCmd], cmdOpts).should.equal(
                    'powershell "Write-Output ""Hello World!"""'
                );
            });
        });

        describe("cmd to powershell with inline options", function () {
            let cmdOpts = {
                shell: "cmd",
                expansion: true,
            };
            let powershellOpts = {
                shell: "powershell",
                expansion: true,
            };

            it("should escape quotes", function () {
                shellEncode(
                    "powershell",
                    ["Write-Output", ["Hello World!"], powershellOpts],
                    cmdOpts
                ).should.equal('powershell "Write-Output ""Hello World!"""');
            });

            it("should escape and replace quotes", function () {
                // TODO: this actually produces the following output in CMD:
                // 1 2 3 ; echo 4 5 6
                shellEncode(
                    "powershell",
                    "-Command",
                    ["echo", ["1 2 3"], ";", "echo", ["4 5 6"], powershellOpts],
                    cmdOpts
                ).should.equal('powershell -Command "echo ""1 2 3"" ; echo ""4 5 6"""');
            });
        });

        describe("bash to powershell", function () {
            let bashOpts = {
                shell: "bash",
            };
            let powershellOpts = {
                shell: "powershell",
                expansion: true,
            };

            it("should escape quotes", function () {
                let powershellCmds = shellEncode(
                    "powershell",
                    ["Write-Output", ["Hello World"]],
                    powershellOpts
                );
                shellEncode(
                    "bash",
                    "-c",
                    [powershellCmds],
                    bashOpts
                ).should.equal(
                    'bash -c \'powershell "Write-Output `"Hello World`""\''
                );
            });
        });

        describe("cmd to powershell to cmd", function () {
            let cmdOpts = {
                shell: "cmd",
                expansion: true,
            };
            let powershellOpts = {
                shell: "powershell",
            };

            it("should escape quotes", function () {
                let innerCmd = shellEncode(
                    "echo",
                    ["im admin"],
                    "&",
                    "pause",
                    cmdOpts
                );
                let powershellCmd = shellEncode(
                    "Start-Process",
                    "-Wait",
                    "powershell",
                    [
                        "-ExecutionPolicy",
                        "Bypass",
                        "-NoProfile",
                        "-Command",
                        ["cmd", "/c", [innerCmd]],
                        { expansion: true },
                    ],
                    "-Verb",
                    "RunAs",
                    powershellOpts
                );
                let outerCmd = shellEncode(
                    "powershell",
                    "-Command",
                    [powershellCmd],
                    cmdOpts
                );
                // TODO: running this command in CMD shows an admin powershell
                // window with "`im admin`".
                // It should just say "im admin".
                outerCmd.should.equal(
                    'powershell -Command "Start-Process -Wait powershell \'-ExecutionPolicy Bypass -NoProfile -Command ""cmd /c \'\'echo `""im admin`"" & pause\'\'""\' -Verb RunAs"'
                );
            });
        });
    });
});
