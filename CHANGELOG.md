# Change Log

## Unpublished

Changes on `master` that have not been published will be listed here.

### Bug Fixes

- Fixed a bug that ignored all shell options except for the shell in `setDefaults()`.
- Fixed CMD encoding.

### Breaking Changes

- Removed buggy shell detection.

## 0.2.0
22 Sep 2020

### Features

- Expansion is now optional.
- Inline options can be passed in nested arrays.
- Add shell default options with `setDefaults()`.

### Breaking Changes

- Expansion is off by default.
- Removed `setDefaultShell()` in favour of `setDefaults()`.

## 0.1.0
3 Oct 2017

*Extracted from a larger private project.*

- Encode Bash, PowerShell and CMD commands with `shellEncode()`.
- Set default shell with `setDefaultShell()`.
