declare module 'shell-test';

export const ShellType = 'bash' | 'powershell' | 'cmd';

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
 * @param {string|string[]|{shell: 'bash'|'powershell'|'cmd'}} cmds 
 * @return {string} Encoded CLI command
 */
export default function shellEncode(...cmds: string | string[] | ShellType): string;

/**
 * Sets the default shell.
 * @param shell 
 */
export function setDefaultShell(shell: ShellType): void;
