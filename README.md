# shell-escape
Escape Bash, PowerShell, CMD and mixed shell CLI commands

![Node.js CI](https://github.com/diatche/shell-escape/workflows/Node.js%20CI/badge.svg)

## Installation

With yarn:

```bash
yarn add shell-escape
```

Or with npm:

```bash
npm install --save shell-escape
```

Has no dependencies.

## Usage

### Import:

```javascript
const encode = require('shell-escape').encode;
// Or with spread operator assignment:
const { encode } = require('shell-escape');
```

ES6 syntax:

```javascript
import { encode } from 'shell-escape';
```

### Basic Usage:

The method `encode()`, encodes a CLI command specified as arguments.
The result is ready to use as a CLI command for the specified shell.
The default shell is bash, but can be [changed](#Changing-the-Default-Shell).

```javascript
var cmd = encode('echo', ['Hello "World"!']);
console.log(cmd);
// Output: echo "Hello \"World\"!"
```

To change the shell, add an options object as the last argument.

For example:

```javascript
var cmd = encode('echo', ['Hello "World"!'], { shell: 'cmd' });
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
var cmd = encode('cmd.run', ['./testscript2', ['arg1', 'arg2']]);
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
var cmd = encode(
    'ps', [
        'Write-Output', ['Hello World!'], { shell: 'powershell' }
    ], { shell: 'cmd' });
console.log(cmd);
// Output: 'ps "Write-Output ""Hello World!"""'
```

### Changing the Default Shell

```javascript
require('shell-escape').setDefaultShell('powershell');
```

ES6 syntax:

```javascript
import { setDefaultShell } from 'shell-escape';
setDefaultShell('powershell');
```
