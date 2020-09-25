const childProcess = require("child_process");
const path = require("path");
const _ = require("lodash");

const kDefaultShell = "bash";
const kShellCommandKey = {
    bash: "-c",
    cmd: "/c",
    powershell: "-Command",
};
const kOuterShellCommandOverrideKey = {
    cmd: ["/s", "/c"],
};

class ChildProcessCleanUtil {
    constructor(child) {
        this.child = child;
    }

    get stdout() {
        return (this._stdout || this.child.stdout || "")
            .toString()
            .replace(/^\s+|\s+$/g, "");
    }
    set stdout(value) {
        this._stdout = value;
    }

    get stderr() {
        return (this._stderr || this.child.stderr || "")
            .toString()
            .replace(/^\s+|\s+$/g, "");
    }
    set stderr(value) {
        this._stderr = value;
    }

    get output() {
        if (this.child.output) {
            return [this.child.output[0], this.stdout, this.stderr];
        }
        return [null, "", ""];
    }
}

function applyUtils(child) {
    child = child || {};
    child.clean = new ChildProcessCleanUtil(child);
    return child;
}

function cleanCmd(cmd) {
    if (cmd && cmd instanceof Array) {
        return cmd;
    } else if (typeof cmd === "string") {
        return [cmd];
    }
    throw new Error(`Bad command`);
}

function spawn(cmd, options) {
    options = typeof options === "object" ? Object.assign({}, options) : {};
    options.shell = options.shell || kDefaultShell;
    options.encoding = options.encoding || "utf8";

    cmd = cleanCmd(cmd);

    var shell = options.shell || kDefaultShell;
    if (options.shell) {
        shell = options.shell;
        delete options.shell;
    }

    let commandKey =
        kOuterShellCommandOverrideKey[shell] || kShellCommandKey[shell];
    if (commandKey) {
        if (process.platform === "win32" && shell === "cmd") {
            // Don't escape cmd shell quotes
            options.windowsVerbatimArguments = true;
        }
        cmd = [commandKey, _.flatten(cmd).join(" ")];
    }
    cmd = _.flatten(cmd);

    var result = childProcess.spawnSync(shell, cmd, options);
    applyUtils(result);
    if (options.throw && result.clean.stderr) {
        throw new Error(result.clean.stderr);
    }
    return result;
}

class Shell {
    static exec(...args) {
        return spawn(...args);
    }
}

module.exports = Shell;
