# CON Debugger for Eduke32

**Version: BETA 0.60**\
**Author: ItsMarcos**

## Overview

CON Debugger is a debugging tool designed for Eduke32, allowing developers to inspect and control the execution of CON scripts in real-time. It interacts with Eduke32 using GDB and provides various debugging commands to inspect variables, set breakpoints, control execution flow, and more.

## Features

- Attach to an Eduke32 process or binary.
- Step through CON script execution.
- Set breakpoints at specific script lines.
- Inspect variables, arrays, and script states.
- Execute raw GDB commands.
- Log debugging information.
- Modify variable values at runtime.

## Requirements

- **Node.js** (for running the debugger)
- **Yarn** (for dependency management)
- **PKG** (for building an executable if needed)
- **GDB** (GNU Debugger)
- **Custom Eduke32 Build**: [Download Here](https://voidpoint.io/marcolino123/e-duke-32-debug)

## Installation

1. Clone the repository:
   ```sh
   git clone <repo_url>
   cd eduke32-con-debugger
   ```
2. Install dependencies:
   ```sh
   yarn
   ```
3. Build the Node.js app:
   ```sh
   yarn build
   ```
4. Build the executable (optional):
   ```sh
   yarn pkg
   ```

## Usage

Run the debugger with the following options:

```sh
condbg -bin <eduke32.exe or PID> [-log] [-err]
```

Example:

```sh
condbg -bin eduke32.exe -log
```

### Running in Development Mode

- **Windows**: `yarn run dev-win`
- **Linux/macOS**: `yarn run dev`

### Options:

- `-bin <file | PID>`: Specify the Eduke32 binary or process ID to attach.
- `-log`: Enable GDB logging.
- `-err`: Enable standard error logging (useful for checking Eduke32 console logs).

## Debugging Commands

### Execution Control

- `continue / c` → Resumes execution from the current point.
- `step / s` → Executes the next instruction.
- `stop` → Pauses execution at the first VM instruction.
- `fullstop` → Completely halts execution.

### Breakpoints

- `break-line <file> <line>` → Sets a breakpoint at a specific line.
- `clear-break-line <file> <line>` → Removes a specific breakpoint.
- `clear` → Removes all breakpoints.

### Debugging Information

- `print-lines [n]` → Displays the last `n` executed lines (default: 6).
- `print-line` → Shows the current line of execution.
- `print-var <name> [type]` → Prints a game variable's value.
- `print-array <name> <index>` → Prints the value at a specific array index.
- `dump-vars` → Dumps all game variable values.
- `info` → Displays script execution details.
- `set-err` → Enable/disable standard error output for GDB.

### Script Execution

- `list-files` → Lists all loaded script files.
- `cmd <gdb command>` → Executes a raw GDB command.
- `start` → Starts execution and continues immediately.
- `con <CON command>` → Executes a CON script command in the game.
- `render` → Calls `videoNextPage()` to refresh the screen.
- `quit / q` → Closes Eduke32 and exits the debugger.

### Variable Manipulation

- `setgg <var> <value> <operation>` → Global variable, global scope.
- `setgp <var> <value> <operation>` → Global variable, player scope.
- `setga <var> <value> <operation>` → Global variable, actor scope.
- `setpg <var> <value> <operation>` → Player variable, global scope.
- `setpp <var> <value> <operation>` → Player variable, player scope.
- `setpa <var> <value> <operation>` → Player variable, actor scope.
- `setag <var> <value> <operation>` → Actor variable, global scope.
- `setap <var> <value> <operation>` → Actor variable, player scope.
- `setaa <var> <value> <operation>` → Actor variable, actor scope.

## Latest Release

**BETA 0.6.0**\
Check the latest releases for updates.

## License

This project is licensed under the MIT License.

## Contributing

Contributions, bug reports, and feature requests are welcome! Feel free to submit a pull request or open an issue.

