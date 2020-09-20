/**
 * Shell type.
 * @typedef {'bash'|'powershell'|'cmd'} ShellType
 */

/**
 * Shell options.
 * @typedef {{
 *     shell: ShellType,
 *     expansion?: boolean,
 * }} ShellOptions
 */

/** @type ShellType[] */
const kSupportedShells = ["bash", "powershell", "cmd"];

const kInvalidBashSingleQuoteStrings = ["'"];

/**
 * Default options;
 * @type ShellOptions
 **/
var _defaults = {
    shell: "bash",
};

/**
 * Sets the default shell options.
 * @param {ShellOptions} options
 */
function setDefaults(options) {
    options = options || {};
    var shell = options.shell;
    if (!shell || typeof shell !== "string") {
        throw new Error("Invalid shell");
    }
    shell = shell.toLowerCase();
    if (kSupportedShells.indexOf(shell) < 0) {
        throw new Error("Invalid shell");
    }
    _defaults = { shell: shell };
    if (options.posix) {
        _defaults.posix = true;
    }
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
 * 1. `shellEncode('echo', ['Hello', 'World!'])` gives:
 *    - `'echo "Hello World!"'`
 *
 * Add an option object as the last argument or item of array
 * to set shell options. Note that different options can be nested.
 *
 * For example:
 * 1. `shellEncode('ps', ['Write-Output', ['Hello', 'World!'], { shell: 'powershell' }], { shell: 'cmd' })` gives:
 *    - `'ps "Write-Output ""Hello World!"""'`
 *
 * @param {string|string[]|ShellOptions} cmds
 * @return {string} Encoded CLI command
 */
function shellEncode(...cmds) {
    return _encode(cmds, {}, true);
}

function _encode(cmds, outerOptions, skipOneLevel) {
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

    var options = {
        ..._defaults,
        ...outerOptions,
        ...inlineOptions,
    };
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
                var innerOptions = {
                    shell: innerShell,
                };
                if (innerShell === options.shell) {
                    innerOptions = { ...options };
                }
                return _encode(cmd, innerOptions);
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
    var stringsToEscape = [];
    var invalidStrings = [];
    var replacements = {};
    switch (options.shell) {
        case "bash":
            // Reference: http://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html#Quoting
            var expansion = options.expansion;
            var literal = !expansion;
            if (typeof expansion === 'undefined') {
                // Prefer single quotes, but check
                // if invalid strings are present.
                for (let invalidString of kInvalidBashSingleQuoteStrings) {
                    if (newCmds.indexOf(invalidString) >= 0) {
                        // Invalid string found, use double quotes
                        expansion = true;
                        break;
                    }
                }
            }
            if (expansion) {
                encloseString = '"';
                escapeString = "\\";
                stringsToEscape = ["\\", '"'];
                if (literal) {
                    // Escape special characters
                    stringsToEscape = stringsToEscape.concat([
                        '$', '`', '!', '\n'
                    ]);
                }
            } else {
                encloseString = "'";
                escapeString = "\\";
                invalidStrings = kInvalidBashSingleQuoteStrings;
            }
            break;
        case "cmd":
            // Reference: https://ss64.com/nt/syntax-esc.html
            if (options.expansion) {
                // TODO: Escape delimiters with ^
                throw new Error("Expansion in CMD is not supported yet");
            }
            encloseString = '"';
            escapeString = '"';
            stringsToEscape = ['"'];
            break;
        case "powershell":
            // References:
            // https://adamtheautomator.com/powershell-escape-double-quotes/
            // https://www.red-gate.com/simple-talk/sysadmin/powershell/when-to-quote-in-powershell/
            if (options.expansion) {
                encloseString = '"';
                escapeString = "`";
                stringsToEscape = ["`", '"'];
                replacements = {
                    '\\`"': '\\`"\\`"\\`"',
                    '`"': '\\`"',
                };
            } else {
                encloseString = "'";
                escapeString = "'";
                stringsToEscape = ["'"];
            }
            break;
        default:
            throw new Error("Unsupported shell: " + options.shell);
    }
    var allReplacements = {};
    invalidStrings.forEach((invalidString) => {
        if (newCmds.indexOf(invalidString) >= 0) {
            throw new Error(
                `Invalid shell command: "${newCmds}". Given the options ${JSON.stringify(
                    options
                )}, the following are invalid: ${JSON.stringify(
                    invalidStrings
                )}`
            );
        }
    });
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

/**
 * Sets the default shell.
 * @param shell
 */
shellEncode.setDefaults = setDefaults;
module.exports = shellEncode;
