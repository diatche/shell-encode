/**
 * Shell type.
 * @typedef {'bash'|'powershell'|'cmd'} ShellType
 */

/**
 * Shell options.
 * 
 * The `program` refers to the script or executable
 * being run.
 * 
 * ### Expansion
 * 
 * When `expansion` is `true`, uses double
 * quote to allow expansion of special characters.
 * Be careful to escape all special characters which
 * you do not want to expand.
 * 
 * When `expansion` is `false`, uses single quotes
 * to preserve literal meaning. If an invalid literal
 * character is present, double quotes are used with
 * special characters escaped.
 * 
 * @typedef {{
 *     shell: ShellType,
 *     program: string,
 *     expansion?: boolean,
 * }} IShellOptions
 */

/** @type ShellType[] */
const kSupportedShells = ["bash", "powershell", "cmd"];

const kInvalidBashSingleQuoteStrings = ["'"];

/**
 * Default options;
 * @type IShellOptions
 **/
var _defaults = {
    shell: "bash",
};

/**
 * Return the current default shell options.
 * @returns {IShellOptions}
 */
function getDefaults() {
    return _defaults;
}

/**
 * Sets the default shell options.
 * @param {IShellOptions} options
 */
function setDefaults(options) {
    options = options || {};
    if (!options.shell || typeof options.shell !== "string") {
        throw new Error("Invalid shell");
    }
    options.shell = options.shell.toLowerCase();
    if (kSupportedShells.indexOf(options.shell) < 0) {
        throw new Error("Invalid shell");
    }
    _defaults = { ...options };
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
 * to set shell options (see {@link IShellOptions}).
 * Note that different options can be nested.
 *
 * For example:
 * 1. `shellEncode('ps', ['Write-Output', ['Hello', 'World!'], { shell: 'powershell' }], { shell: 'cmd' })` gives:
 *    - `'ps "Write-Output ""Hello World!"""'`
 *
 * @param {string|string[]|IShellOptions} cmds
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
    };
    if (skipOneLevel) {
        options = {
            ...options,
            ...inlineOptions,
        };
    }
    inlineOptions = inlineOptions || {};
    var newCmds = cmds;
    var enclose = false;
    var program = options.program || '';

    if (newCmds && newCmds instanceof Array) {
        var innerShell = options.shell;
        if (inlineOptions && inlineOptions.shell) {
            innerShell = inlineOptions.shell;
        }
        if (innerShell === options.shell) {
            inlineOptions = {
                ...options,
                ...inlineOptions,
                shell: innerShell,
            };
            if (program) {
                inlineOptions.program = program;
            }
        }

        newCmds = newCmds
            .map((cmd, i) => {
                if (typeof cmd === "object" && cmd instanceof Array) {
                    cmd = _encode(cmd, inlineOptions);
                }
                if (i === 0 && !program) {
                    program = cmd;
                    inlineOptions.program = program;
                }
                return cmd;
            });
        
        if (options.shell === 'cmd' && newCmds.length === 2 && newCmds[0] === 'echo' && !newCmds[1]) {
            // Special case: echo empty line.
            // Reference: https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/echo
            newCmds = 'echo.';
        } else {
            newCmds = newCmds.join(" ");
        }

        if (skipOneLevel) {
            return newCmds;
        }
        enclose = true;
    }
    if (typeof newCmds !== "string") {
        throw new Error(`Bad commands`);
    }

    var encloseString = "";
    var encloseStartString = "";
    var encloseEndString = "";
    var escapeString = "";
    var stringsToEscape = [];
    var invalidStrings = [];
    var replacements = {};
    var expansion = options.expansion;
    switch (options.shell) {
        case "bash":
            // Reference: http://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html#Quoting
            var literal = !expansion;
            if (!expansion) {
                // Check if invalid strings are present.
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
            
            // if (newCmds.indexOf('"') >= 0) {
            //     // Double quotes present, keep using double quotes
            //     encloseString = '"';
            //     escapeString = '^';
            //     stringsToEscape = ['\r\n', '\n'];
            //     replacements = {
            //         '"': '"""', // Double up quotes to escape inside quotes
            //     };
            //     if (!expansion) {
            //         Object.assign(replacements, {
            //             '%': '%%', // Double percent to escape inside quotes
            //         });
            //     }
            // } else {
            
                // No double quotes present.
                // Avoid enclosing in quotes as this potentially
                // adds quotes to the passed argument, which then
                // need to be dequoted.
                escapeString = '^';
                stringsToEscape = [
                    ' ', ',', ';', '=', '\t', '\r\n', '\n'
                    // ,'(', ')'
                ];
                if (program !== 'echo') {
                    replacements = {
                        '"': '\\^"',
                    };
                }
                if (!expansion) {
                    stringsToEscape = stringsToEscape.concat([
                        '\\', '&', '<', '>', '^', '|', '%', '!'
                        ,'(', ')'
                    ]);
                    replacements['!'] = '^^!'; // Escape delayed expansion
                }
            // }
            break;
        case "powershell":
            // References:
            // https://adamtheautomator.com/powershell-escape-double-quotes/
            // https://www.red-gate.com/simple-talk/sysadmin/powershell/when-to-quote-in-powershell/
            if (expansion) {
                encloseString = '"';
                escapeString = "`";
                // TODO: When a region delimited by single quotes
                // is found, only escape double quotes
                // (and make no replacements?)
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
    if (encloseString) {
        if (!encloseStartString) {
            encloseStartString = encloseString;
        }
        if (!encloseEndString) {
            encloseEndString = encloseString;
        }
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
        escapedCmds = encloseStartString + escapedCmds + encloseEndString;
    }

    return escapedCmds;
}

shellEncode.getDefaults = getDefaults;
shellEncode.setDefaults = setDefaults;
module.exports = shellEncode;
