const shellEncode = require('../..');
const shell = require('../shell');

describe('shellEncode (cmd & powershell)', () => {
    it('should escape nested powershell without expansion', function () {
        let cmd = shellEncode(
            'powershell',
            ['Write-Output', ['Hello World!'], { shell: 'powershell' }],
            { shell: 'cmd' }
        );
        console.debug('cmd: ' + cmd);
        let res = shell.exec(cmd, { shell: 'cmd' });
        console.debug('stdout: ' + res.clean.stdout);
        expect(res.clean.stdout).toBe('Hello World!');
    });

    it('should escape nested powershell with expansion', function () {
        let cmd = shellEncode(
            'powershell',
            [
                // 'Set-PSDebug -Trace 1;',
                '$Name=',
                ['World'],
                ';',
                'Write-Output',
                ['Hello $Name!'],
                { shell: 'powershell', expansion: true },
            ],
            { shell: 'cmd' }
        );
        console.debug('cmd: ' + cmd);
        let res = shell.exec(cmd, { shell: 'cmd' });
        console.debug('stdout: ' + res.clean.stdout);
        expect(res.clean.stdout).toBe('Hello World!');
    });

    it('should allow multiple statements', function () {
        let cmd = shellEncode(
            'powershell',
            '-Command',
            [
                // 'Set-PSDebug -Trace 1;',
                'echo',
                ['1 2 3'],
                ';',
                'echo',
                ['4 5 6'],
                { shell: 'powershell' },
            ],
            { shell: 'cmd' }
        );
        console.debug('cmd: ' + cmd);
        let res = shell.exec(cmd, { shell: 'cmd' });
        console.debug('stdout: ' + res.clean.stdout);
        expect(res.clean.stdout).toBe('1 2 3\n4 5 6');
    });

    it('should allow CMD (literal) to PowerShell (literal) to CMD (expansion)', function () {
        let cmd = shellEncode(
            'powershell',
            [
                // 'Set-PSDebug -Trace 1;',
                'cmd',
                '/c',
                [
                    'echo',
                    '%OS%',
                    { shell: 'cmd', expansion: true }
                ],
                { shell: 'powershell' },
            ],
            { shell: 'cmd' }
        );
        console.debug('cmd: ' + cmd);
        let res = shell.exec(cmd, { shell: 'cmd' });
        console.debug('stdout: ' + res.clean.stdout);
        expect(res.clean.stdout).toBe('Windows_NT');
    });

    it('should allow CMD (expansion) to PowerShell (expansion) to CMD (literal)', function () {
        let cmd = shellEncode(
            'powershell',
            [
                // 'Set-PSDebug -Trace 1;',
                'cmd',
                '/c',
                [
                    'echo',
                    '%OS%',
                    { shell: 'cmd', expansion: false }
                ],
                { shell: 'powershell', expansion: true },
            ],
            { shell: 'cmd', expansion: true }
        );
        console.debug('cmd: ' + cmd);
        let res = shell.exec(cmd, { shell: 'cmd' });
        console.debug('stdout: ' + res.clean.stdout);
        expect(res.clean.stdout).toBe('Windows_NT');
    });
});
