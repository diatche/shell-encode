declare module 'shell-test';

export const ShellType = 'bash' | 'powershell' | 'cmd';

export function encode(...cmds: string | string[] | ShellType): string;

/**
 * Sets the default shell.
 * @param shell 
 */
export function setDefaultShell(shell: ShellType): void;
