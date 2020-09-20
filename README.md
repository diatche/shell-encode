# shell-encode
Escape Bash, PowerShell, CMD and mixed shell CLI commands.

![Node.js CI](https://github.com/diatche/shell-encode/workflows/Node.js%20CI/badge.svg)

## Installation

With yarn:

```bash
yarn add shell-encode
```

Or with npm:

```bash
npm install --save shell-encode
```

Has no dependencies. TypeScript types defined.

## Usage

### Import:

```javascript
const shellEncode = require('shell-encode');
```

ES6 syntax:

```javascript
import shellEncode from 'shell-encode';
```

### Basic Usage:

The method `shellEncode()`, encodes a CLI command specified as arguments.
The result is ready to use as a CLI command for the specified shell.
The default shell is bash, but can be [changed](#Changing-the-Default-Shell).

```javascript
var cmd = shellEncode('echo', ['Hello "World"!']);
console.log(cmd);
// Output: echo "Hello \"World\"!"
```

To change the shell, add an options object as the last argument.

For example:

```javascript
var cmd = shellEncode('echo', ['Hello "World"!'], { shell: 'cmd' });
console.log(cmd);
// Output: echo "Hello ""World""!"
```

### Nested Arguments

Specifiying an array instead of a string combines the
contents of the array into a single string argument.
This is usefull when you want to pass nested arguments.

For example:

```javascript
// cmd.run with testscript2, which has its own arguments:
var cmd = shellEncode('cmd.run', ['./testscript2', ['arg1', 'arg2']]);
console.log(cmd);
// Output: cmd.run "./testscript2 \"arg1 arg2\""
```

### Cross-Shell Encoding

You may want to call another shell from within a command.
Specify the nested shell options as the last argument or
item of the argument array.

For example:

```javascript
// Call PowerShell from within CMD:
var cmd = shellEncode(
    'ps', [
        'Write-Output', ['Hello World!'], { shell: 'powershell' }
    ], { shell: 'cmd' });
console.log(cmd);
// Output: 'ps "Write-Output ""Hello World!"""'
```

### Changing the Default Shell

```javascript
shellEncode.setDefaults('powershell');
```
