const shellEncode = require("../..");
const shell = require('../shell');

describe('shellEncode (cmd & powershell)', () => {

    it("should escape nested powershell", function () {
        let cmd = shellEncode("powershell", [
            "Set-PSDebug -Trace 1;",
            "$Name=", ['World'], ';',
            "Write-Output",
            ["Hello $Name!"],
            { shell: 'powershell', expansion: true }
        ], { shell: 'cmd' });
        // powershell Set-PSDebug^ -Trace^ 1^;^ $Name^=^ ^"World^"^ ^;^ Write-Output^ ^"Hello^ $Name!^"
        let res = shell.exec(cmd, { shell: 'cmd' });
        expect(res.clean.stdout).toBe('Windows_NT');
    });
});
