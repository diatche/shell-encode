require("assert");
require("should");
const shellEncode = require("..");

describe("shellEncode", function () {
    context("bash shell", function () {
        let opts = {
            shell: "bash",
        };

        context("strings as arguments", function () {
            it("should return the same strings joined with a space", function () {
                shellEncode("foo", "bar", opts).should.equal("foo bar");
            });
        });

        context("string with quotes as arguments", function () {
            it("should not escape quotes", function () {
                shellEncode('"foo"', opts).should.equal('"foo"');
            });
        });

        context("string in an array", function () {
            it("should return the same string joined with a space and enclosed with quotes", function () {
                shellEncode(["foo", "bar"], opts).should.equal('"foo bar"');
            });
        });

        context("string with quotes in an array", function () {
            it("should escape quotes", function () {
                shellEncode(["foo", '"bar wat"'], opts).should.equal(
                    '"foo \\"bar wat\\""'
                );
            });
        });

        context("single nested array", function () {
            it("should escape quotes", function () {
                shellEncode(["foo", ["bar", "wat"]], opts).should.equal(
                    '"foo \\"bar wat\\""'
                );
            });
        });

        context("mixed strings and array arguments", function () {
            it("should enclose only array arguments", function () {
                shellEncode("foo", ["bar", "wat"], opts).should.equal(
                    'foo "bar wat"'
                );
            });
        });

        context("single nested array with quotes", function () {
            it("should escape quotes", function () {
                shellEncode(["foo", ['bar "wat"']], opts).should.equal(
                    '"foo \\"bar \\\\\\"wat\\\\\\"\\""'
                );
            });
        });

        context("double nested arrays", function () {
            it("should escape quotes", function () {
                shellEncode(["foo", ["bar", ["wat"]]], opts).should.equal(
                    '"foo \\"bar \\\\\\"wat\\\\\\"\\""'
                );
            });
        });

        context("triple nested arrays", function () {
            it("should escape quotes", function () {
                shellEncode(
                    ["one", ["two", ["three", ["four"]]]],
                    opts
                ).should.equal(
                    '"one \\"two \\\\\\"three \\\\\\\\\\\\\\"four\\\\\\\\\\\\\\"\\\\\\"\\""'
                );
            });
        });

        context("double nested arrays with quotes", function () {
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

    context("cmd shell", function () {
        let opts = {
            shell: "cmd",
        };

        context("strings as arguments", function () {
            it("should return the same strings joined with a space", function () {
                shellEncode("foo", "bar", opts).should.equal("foo bar");
            });
        });

        context("string in an array", function () {
            it("should return the same string joined with a space and enclosed with quotes", function () {
                shellEncode(["foo", "bar"], opts).should.equal('"foo bar"');
            });
        });

        context("mixed strings and array arguments", function () {
            it("should enclose only array arguments", function () {
                shellEncode("foo", ["bar", "wat"], opts).should.equal(
                    'foo "bar wat"'
                );
            });
        });

        context("single nested array", function () {
            it("should escape quotes", function () {
                shellEncode(["foo", ["bar", "wat"]], opts).should.equal(
                    '"foo ""bar wat"""'
                );
            });
        });

        context("double nested arrays", function () {
            it("should escape quotes", function () {
                shellEncode(["foo", ["bar", ["wat"]]], opts).should.equal(
                    '"foo ""bar """"wat"""""""'
                );
            });
        });
    });

    context("powershell shell", function () {
        let opts = {
            shell: "powershell",
        };

        context("strings as arguments", function () {
            it("should return the same strings joined with a space", function () {
                shellEncode("foo", "bar", opts).should.equal("foo bar");
            });
        });

        context("string in an array", function () {
            it("should return the same string joined with a space and enclosed with quotes", function () {
                shellEncode(["foo", "bar"], opts).should.equal('"foo bar"');
            });
        });

        context("mixed strings and array arguments", function () {
            it("should enclose only array arguments", function () {
                shellEncode("foo", ["bar", "wat"], opts).should.equal(
                    'foo "bar wat"'
                );
            });
        });

        context("single nested array", function () {
            it("should escape quotes", function () {
                shellEncode(["foo", ["bar", "wat"]], opts).should.equal(
                    '"foo `"bar wat`""'
                );
            });
        });

        context("double nested arrays", function () {
            it("should escape quotes", function () {
                shellEncode(["foo", ["bar", ["wat"]]], opts).should.equal(
                    '"foo `"bar \\`"wat\\`"`""'
                );
            });
        });
    });

    context("mixed shell", function () {
        context("cmd to powershell", function () {
            let cmdOpts = {
                shell: "cmd",
            };
            let powershellOpts = {
                shell: "powershell",
            };

            it("should escape quotes", function () {
                let psCmd = shellEncode(
                    "Write-Output",
                    ["Hello World!"],
                    powershellOpts
                );
                shellEncode("ps", [psCmd], cmdOpts).should.equal(
                    'ps "Write-Output ""Hello World!"""'
                );
            });
        });
        context("cmd to powershell with inline options", function () {
            let cmdOpts = {
                shell: "cmd",
            };
            let powershellOpts = {
                shell: "powershell",
            };

            it("should escape quotes", function () {
                shellEncode(
                    "ps",
                    ["Write-Output", ["Hello World!"], powershellOpts],
                    cmdOpts
                ).should.equal('ps "Write-Output ""Hello World!"""');
            });
        });

        context("bash to powershell", function () {
            let bashOpts = {
                shell: "bash",
            };
            let powershellOpts = {
                shell: "powershell",
            };

            it("should escape quotes", function () {
                let powershellCmds = shellEncode(
                    "ps",
                    ["bar", ["wat"]],
                    powershellOpts
                );
                shellEncode(["b", [powershellCmds]], bashOpts).should.equal(
                    '"b \\"ps \\\\\\"bar \\\\\\`\\\\\\"wat\\\\\\`\\\\\\"\\\\\\"\\""'
                );
            });
        });

        // context("cmd to powershell to cmd", function () {
        //     let cmdOpts = {
        //         shell: "cmd",
        //     };
        //     let powershellOpts = {
        //         shell: "powershell",
        //     };

        //     it("should escape quotes", function () {
        //         let innerCmd = shellEncode(['echo "im admin"'], cmdOpts);
        //         let powershellCmd = shellEncode(
        //             "Start-Process",
        //             "-Wait",
        //             "powershell",
        //             [
        //                 "-ExecutionPolicy",
        //                 "Bypass",
        //                 "-NoProfile",
        //                 "-Command",
        //                 innerCmd,
        //             ],
        //             "-Verb",
        //             "RunAs",
        //             powershellOpts
        //         );
        //         let outerCmd = shellEncode(
        //             "powershell",
        //             "-Command",
        //             [powershellCmd],
        //             cmdOpts
        //         );
        //         outerCmd.should.equal(
        //             'powershell -Command "Start-Process -Wait powershell \\"-ExecutionPolicy Bypass -NoProfile -Command `\\"echo \\`\\"im admin\\`\\"`\\"\\" -Verb RunAs"'
        //         );
        //     });
        // });
    });
});
