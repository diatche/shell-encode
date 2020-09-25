const shellEncode = require("../..");
const shell = require('../shell');

describe('shellEncode (bash)', () => {

    beforeEach(() => {
        shellEncode.setDefaults({ shell: 'bash' });
    });

    describe("without expansion", function () {
        beforeEach(() => {
            shellEncode.setDefaults({
                shell: 'bash',
                expansion: false,
            });
        });

        it("should encode a command with no nesting", function () {
            let cmd = shellEncode("echo", ["$TEST_VAR"]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('$TEST_VAR');
        });

        it("should encode a command with nested level 1", function () {
            let cmd = shellEncode("bash", "-c", ["echo", ["$TEST_VAR"]]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('$TEST_VAR');
        });
    });

    describe("with expansion", function () {
        beforeEach(() => {
            shellEncode.setDefaults({
                shell: 'bash',
                expansion: true,
            });
        });

        it("should encode a command with no nesting", function () {
            let cmd = shellEncode("TEST_VAR=123;", "echo", ["$TEST_VAR"]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('123');
        });

        it("should encode a command with nested level 1", function () {
            let cmd = shellEncode("TEST_VAR=123;", "bash", "-c", ["echo", ["$TEST_VAR"]]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('123');
        });
    });
});
