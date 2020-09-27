const shellEncode = require("../..");
const shell = require('../shell');

describe('shellEncode (cmd)', () => {

    beforeEach(() => {
        shellEncode.setDefaults({ shell: 'cmd' });
    });

    describe("without expansion", function () {
        beforeEach(() => {
            shellEncode.setDefaults({
                shell: 'cmd',
                expansion: false,
            });
        });

        it("should encode a command with no nesting", function () {
            let cmd = shellEncode("echo", ["%OS%"]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('%OS%');
        });

        it("should encode a command with nested level 1", function () {
            let cmd = shellEncode("cmd", "/c", ["echo", ["%OS%"]]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('%OS%');
        });
    });

    describe("with expansion", function () {
        beforeEach(() => {
            shellEncode.setDefaults({
                shell: 'cmd',
                expansion: true,
            });
        });

        it("should encode a command with no nesting", function () {
            let cmd = shellEncode("echo", ["%OS%"]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('Windows_NT');
        });

        it("should encode a command with nested level 1", function () {
            let cmd = shellEncode("cmd", "/c", ["echo", ["%OS%"]]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('Windows_NT');
        });
    });
});
