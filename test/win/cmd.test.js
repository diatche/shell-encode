const shellEncode = require('../..');
const shell = require('../shell');

describe('shellEncode (cmd)', () => {
    beforeEach(() => {
        shellEncode.setDefaults({ shell: 'cmd' });
    });

    describe('without expansion', function () {
        beforeEach(() => {
            shellEncode.setDefaults({
                shell: 'cmd',
                expansion: false,
            });
        });

        it('should encode a command with no nesting', function () {
            let cmd = shellEncode('echo', ['%OS%', '%OS%']);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('%OS% %OS%');
        });

        it('should encode an echo with empty string', function () {
            let cmd = shellEncode('echo', '');
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('');
        });

        it('should encode an echo with an empty encoded string', function () {
            let cmd = shellEncode('echo', ['']);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('');
        });

        it('should encode a command with double quotes', function () {
            let cmd = shellEncode('echo', '"red" apple');
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('"red" apple');
        });

        it('should encode a command with nested double quotes', function () {
            let cmd = shellEncode('echo', ['"red" apple']);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('"red" apple');
        });

        it('should encode a command with new lines', function () {
            let cmd = shellEncode('echo', ['123\r\n345']);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('123\n345');
        });

        it('should encode a command with nested level 1', function () {
            let cmd = shellEncode('cmd', '/c', ['echo', ['%OS%', '%OS%']]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('%OS% %OS%');
        });

        it('should encode a command with nested level 2', function () {
            let cmd = shellEncode('echo', ['echo', ['echo', ['123']]]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('echo echo^ 123');
        });

        it('should encode a piped command', function () {
            let cmd = shellEncode('break', '|', ['echo', ['%OS%', '%OS%']]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('%OS% %OS%');
        });
    });

    describe('with expansion', function () {
        beforeEach(() => {
            shellEncode.setDefaults({
                shell: 'cmd',
                expansion: true,
            });
        });

        it('should encode a command with no nesting', function () {
            let cmd = shellEncode('echo', ['%OS%', '%OS%']);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('Windows_NT Windows_NT');
        });

        it('should encode a command with nested level 1', function () {
            let cmd = shellEncode('cmd', '/c', ['echo', ['%OS%', '%OS%']]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('Windows_NT Windows_NT');
        });

        it('should encode a command with nested delayed expansion', function () {
            let cmd = shellEncode('cmd', '/c', ['echo', ['%OS%', '%OS%']]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('Windows_NT Windows_NT');
        });

        it('should encode a piped command', function () {
            let cmd = shellEncode('break', '|', ['echo', ['%OS%', '%OS%']]);
            let res = shell.exec(cmd);
            expect(res.clean.stdout).toBe('Windows_NT Windows_NT');
        });
    });
});
