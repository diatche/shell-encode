const shellEncode = require('..');

describe('readme', () => {
    describe('basic usage', () => {
        it('should show correct output with defaults', () => {
            var cmd = shellEncode('echo', ['Hello "World"!']);
            expect(cmd).toBe("echo 'Hello \"World\"!'");
        });
        it('should show correct output with CMD shell', () => {
            var cmd = shellEncode('echo', ['Hello "World"!'], { shell: 'cmd' });
            expect(cmd).toBe('echo Hello^ \"World\"^!');
        });
    });

    describe('nested arguments', () => {
        it('should show correct output', () => {
            var cmd = shellEncode('cmd.run', ['./testscript2', ['arg1', 'arg2']]);
            expect(cmd).toBe("cmd.run \"./testscript2 'arg1 arg2'\"");
        })
    });

    describe('cross-shell encoding', () => {
        it('should show correct output', () => {
            var cmd = shellEncode(
            'powershell', [
                'Write-Output', ['Hello World!'], { shell: 'powershell' }
            ], { shell: 'cmd' });
            expect(cmd).toBe("powershell Write-Output^ 'Hello^ World^!'");
        })
    });
});
