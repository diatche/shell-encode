const shellEncode = require("../..");
const shell = require('../shell');

describe('shellEncode (powershell)', () => {

    beforeEach(() => {
        shellEncode.setDefaults({ shell: 'powershell' });
    });

    describe("without expansion", function () {
        beforeEach(() => {
            shellEncode.setDefaults({
                shell: 'powershell',
                expansion: false,
            });
        });

        it("should encode a command with no nesting", function () {
            let cmd = shellEncode("$TEST_VAR=123;", "echo", ["$TEST_VAR"]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('$TEST_VAR');
        });

        it("should encode a command with nested level 1", function () {
            let cmd = shellEncode("$TEST_VAR=123;", "powershell", ["Write-Output", ["$TEST_VAR"]]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('$TEST_VAR');
        });
    });

    describe("with expansion", function () {
        beforeEach(() => {
            shellEncode.setDefaults({
                shell: 'powershell',
                expansion: true,
            });
        });

        it("should encode a command with no nesting", function () {
            let cmd = shellEncode("$TEST_VAR=123;", "echo", ["$TEST_VAR"]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('123');
        });

        it("should encode a command with nested level 1", function () {
            let cmd = shellEncode("$TEST_VAR=123;", "powershell", ["Write-Output", ["$TEST_VAR"]]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('123');
        });
    });
});
