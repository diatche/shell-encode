declare module 'shell-test';

/**
 * Shell type.
 */
export const ShellType = 'bash' | 'powershell' | 'cmd';

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
 */
export interface IShellOptions {
    shell: ShellType;
    program: string;
    expansion?: boolean;
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
export default function shellEncode(...cmds: string | string[] | IShellOptions): string;

/**
 * Sets the default shell options.
 * @param options 
 */
export function setDefaults(options: IShellOptions): void;
