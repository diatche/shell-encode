const kSupportedShells = ['bash', 'powershell', 'cmd'];
var _defaultShell = 'bash';

function setDefaultShell(shell) {
    if (!shell || typeof shell !== 'string') {
        throw new Error('Invalid shell');
    }
    shell = shell.toLowerCase();
    if (kSupportedShells.indexOf(shell) < 0) {
        throw new Error('Invalid shell');
    }
    _defaultShell = shell;
}

/**
 * Encodes a CLI command specified as arguments.
 * The result is ready to use as a CLI command for the
 * specified shell.
 * 
 * Specifiying an array instead of a string combines the
 * contents of the array into a single string argument.
 * This is usefull to form a single string argument or
 * to pass nested arguments. Cross-shell encoding is supported.
 * 
 * The following examples assume that bash is the default shell: 
 * 1. `encode('echo', ['Hello', 'World!'])` gives:
 *    - `'echo "Hello World!"'`
 * 
 * Add an option object as the last argument or item of array
 * to set shell options. Note that different options can be nested.
 * 
 * For example: 
 * 1. `encode('ps', ['Write-Output', ['Hello', 'World!'], { shell: 'powershell' }], { shell: 'cmd' })` gives:
 *    - `'ps "Write-Output ""Hello World!"""'`
 * 
 * @param {string|string[]|{shell: 'bash'|'powershell'|'cmd'}} cmds 
 * @return {string} Encoded CLI command
 */
function encode(...cmds) {
    return _encode(cmds, {}, true);
}

function _encode(cmds, options, skipOneLevel) {
    var maybeOptions = cmds[cmds.length - 1];
    var inlineOptions = null;
    if (
        !(
            typeof maybeOptions === "string" ||
            (typeof maybeOptions === "object" && maybeOptions instanceof Array)
        )
    ) {
        inlineOptions = cmds.pop();
    }

    options = options || inlineOptions || {};
    options.shell = options.shell || _defaultShell;
    var newCmds = cmds;
    var enclose = false;

    if (newCmds && newCmds instanceof Array) {
        var innerShell = options.shell;
        if (inlineOptions && inlineOptions.shell) {
            innerShell = inlineOptions.shell;
        } else if (newCmds.length > 2) {
            // Detect inner shell
            switch (newCmds[0]) {
                case "bash":
                case "cmd":
                case "powershell":
                    innerShell = newCmds[0];
                    break;
                default:
                    break;
            }
        }

        newCmds = newCmds
            .map((cmd) => {
                if (!(typeof cmd === "object" && cmd instanceof Array)) {
                    return cmd;
                }
                return _encode(cmd, {
                    shell: innerShell,
                });
            })
            .join(" ");

        if (skipOneLevel) {
            return newCmds;
        }
        enclose = true;
    }
    if (typeof newCmds !== "string") {
        throw new Error(`Bad commands`);
    }

    var encloseString = "";
    var escapeString = "";
    var stringsToEscape = "";
    var replacements = {};
    switch (options.shell) {
        case "bash":
            encloseString = '"';
            escapeString = "\\";
            stringsToEscape = ["\\", '"', "`"];
            break;
        case "cmd":
            encloseString = '"';
            escapeString = '"';
            stringsToEscape = ['"'];
            break;
        case "powershell":
            encloseString = '"';
            escapeString = "`";
            stringsToEscape = ["`", '"', "$"];
            replacements = {
                '\\`"': '\\`"\\`"\\`"',
                '`"': '\\`"',
            };
            break;
        default:
            throw new Error("Unsupported shell: " + options.shell);
    }
    var allReplacements = {};
    Object.keys(replacements).forEach((stringToReplace) => {
        allReplacements[stringToReplace] = replacements[stringToReplace];
    });
    stringsToEscape.forEach((stringToEscape) => {
        allReplacements[stringToEscape] = escapeString + stringToEscape;
    });
    let allStringsToReplace = Object.keys(allReplacements);
    let len = newCmds.length;
    var stringToReplaceNow = "";
    var escapedCmds = "";
    // Note: We avoid global replace because some of
    // the replacements overlap
    for (var i = 0; i < len; i += 1) {
        stringToReplaceNow = allStringsToReplace.find((stringToReplace) => {
            return (
                stringToReplace === newCmds.slice(i, i + stringToReplace.length)
            );
        });
        if (stringToReplaceNow) {
            escapedCmds += allReplacements[stringToReplaceNow];
            i += stringToReplaceNow.length - 1;
            continue;
        }
        escapedCmds += newCmds[i];
    }

    if (enclose) {
        escapedCmds = encloseString + escapedCmds + encloseString;
    }

    return escapedCmds;
}

module.exports = {
    encode: encode,
    setDefaultShell: setDefaultShell,
};
