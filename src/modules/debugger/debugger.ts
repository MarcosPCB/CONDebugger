import process from "process";
import GDBDebugger from "./services/GDBDebugger";
import * as readline from "readline";

const rL = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const helpText = `
\x1b[1;36mCON Debugger Commands Help\x1b[0m

\x1b[1;31mIMPORTANT:\x1b[0m Before executing any commands, you must first run: \x1b[1;33mstart\x1b[0m

\x1b[1;32mExecution Control:\x1b[0m
  \x1b[1;34mcontinue / c\x1b[0m → Resumes execution from the current point.
  \x1b[1;34mstep / s\x1b[0m → Executes the next instruction.
  \x1b[1;34mstop\x1b[0m → Pauses execution at the first VM instruction executedbg.
  \x1b[1;34mfullstop\x1b[0m → Completely halts execution.

\x1b[1;33mBreakpoints:\x1b[0m
  \x1b[1;35mbreak-line <file> <line>\x1b[0m → Sets a breakpoint at a specific line in a file.
  \x1b[1;35mclear-break-line <file> <line>\x1b[0m → Removes a breakpoint from a specific line.
  \x1b[1;35mclear\x1b[0m → Removes all line breakpoints.

\x1b[1;34mInformation & Debugging:\x1b[0m
  \x1b[1;36mprint-lines [n]\x1b[0m → Displays the last n lines of execution (default: 6).
  \x1b[1;36mprint-var <name> [type]\x1b[0m → Prints the value of a game variable.
  \x1b[1;36mprint-array <name> <index>\x1b[0m → Prints the value of a game array at a given index.
  \x1b[1;36mdump-vars\x1b[0m → Calls Gv_DumpValues(), dumping all variable values (-log enabled).
  \x1b[1;36minfo\x1b[0m → Calls VM_ScriptInfo(insptr, 64), showing script details (-log enabled).
  \x1b[1;36mset-err\x1b[0m → Enable/disable Standard ERR for GDB (if you wanna look into Eduke32 Log messages keep this true)

\x1b[1;35mScript Execution & Debugging:\x1b[0m
  \x1b[1;33mlist-files\x1b[0m → Lists all script files currently loaded.
  \x1b[1;33mcmd <gdb command>\x1b[0m → Executes a raw GDB command (-log enabled).
  \x1b[1;33mstart\x1b[0m → Starts execution and continues immediately.
  \x1b[1;33mcon <CON command>\x1b[0m → Executes a CON script command in the game (BE CAREFUL - UNSAFE).
  \x1b[1;33mrender\x1b[0m → Calls "videoNextPage()" to refresh the screen.
  \x1b[1;33mquit / q\x1b[0m → Closes Eduke32 and exits the debugger.

\x1b[1;31mVariable/label Manipulation (you can use decimal numbers as well):\x1b[0m
  \x1b[1;32msetgg <var> <value> <operation>\x1b[0m → Global variable, global scope.
  \x1b[1;32msetgp <var> <value> <operation>\x1b[0m → Global variable, player scope.
  \x1b[1;32msetga <var> <value> <operation>\x1b[0m → Global variable, actor scope.
  \x1b[1;32msetpg <var> <value> <operation>\x1b[0m → Player variable, global scope.
  \x1b[1;32msetpp <var> <value> <operation>\x1b[0m → Player variable, player scope.
  \x1b[1;32msetpa <var> <value> <operation>\x1b[0m → Player variable, actor scope.
  \x1b[1;32msetag <var> <value> <operation>\x1b[0m → Actor variable, global scope.
  \x1b[1;32msetap <var> <value> <operation>\x1b[0m → Actor variable, player scope.
  \x1b[1;32msetaa <var> <value> <operation>\x1b[0m → Actor variable, actor scope.
`;

async function Prompt(dbg: GDBDebugger) {
    rL.question('> ', async (e) => {
        if(e == 'quit' || e == 'q') {
            dbg.sendCommand('quit');
            console.log('Bye bye!');
            rL.close();
            process.exit(0);
        }

        let args: string[] = [];

        e += ' ';

        switch(e.slice(0, e.indexOf(' '))) {
            case `set-err`:
                args = e.slice(String('set-err').length + 1, e.length).split(' ');
                dbg.err = Boolean(args[0]);
                console.log(`GDB Standard ERR is ${dbg.err}`);
                break;

            case 'continue':
            case 'c':
                await dbg.continueExecution();
                break;

            case 'step':
            case 's':
                await dbg.stepInto();
                break;

            case 'break-line':
                await dbg.pause();
                args = e.slice(String('break-line').length + 1, e.length).split(' ');
                await dbg.SetBreakpointAtLine(args[0], Number(args[1]));
                dbg.sendCommand('-exec-continue');
                break;

            case 'clear-break-line':
                await dbg.pause();
                args = e.slice(String('clear-break-line').length + 1, e.length).split(' ');
                await dbg.UnsetBreakpointAtLine(args[0], Number(args[1]));
                dbg.sendCommand('-exec-continue');
                break;

            case 'list-files':
                console.log(dbg.scriptFilenames.join(', '));
                break;

            case 'cmd':
                dbg.sendCommand(e.slice(4, e.length));
                break;

            case 'fullstop':
                dbg.pause(true);
                break;

            case 'stop':
                await dbg.pause();
                await dbg.stepInto();
                break;

            case 'clear':
                await dbg.pause();
                await dbg.RemoveAllLineBreapoints();
                await dbg.sendCommand('-break-delete');
                dbg.cleared = false;
                dbg.bps.length = dbg.bps_line.length = 0;
                break;

            case 'print-lines': 
                await dbg.pause();
                args = e.slice(String('print-lines').length + 1, e.length).split(' ');
                let num_lines = 6;
                num_lines = isNaN(Number(args[0])) ? 6 : Number(args[0]);

                if(num_lines <= 0)
                    num_lines = 6;

                await dbg.PrintWhereItStopped(num_lines);
                break;

            case 'print-var': 
                await dbg.pause();
                args = e.slice(String('print-var').length + 1, e.length).split(' ');

                let type = isNaN(Number(args[1])) ? 0 : Number(args[1]);

                await dbg.GetCurrentGameVarValue(args[0], type);
                break;

            case 'print-array': 
                await dbg.pause();
                args = e.slice(String('print-var').length + 1, e.length).split(' ');

                let index = isNaN(Number(args[1])) ? 0 : Number(args[1]);

                await dbg.GetCurrentGameArrayValue(args[0], index);
                break;

            case 'dump-vars':
                await dbg.pause();
                dbg.sendCommand('call Gv_DumpValues()');
                break;

            case 'info':
                await dbg.pause();
                dbg.sendCommand('call VM_ScriptInfo(insptr, 64)');
                break;

            case 'start':
                await dbg.firstStart();
                dbg.sendCommand('-exec-continue');
                break;

            case `con`:
                let cont = dbg.paused;
                
                await dbg.pause();
                if(!cont)
                    await dbg.stepInto();

                await dbg.wait();

                args = e.slice(String('con').length + 1, e.length).split(' ');
                await dbg.ExecuteCON(args.join(` `));

                if(!cont)
                    await dbg.continueExecution();
                break;

            case `setgg`:
                await dbg.pause();
                args = e.slice(String('setgg').length + 1, e.length).split(' ');
                await dbg.VariableOperations(args[0], args[2], args[1], 0, 0);
                break;

            case `setgp`:
                await dbg.pause();
                args = e.slice(String('setgg').length + 1, e.length).split(' ');
                await dbg.VariableOperations(args[0], args[2], args[1], 0, 1);
                break;

            case `setga`:
                await dbg.pause();
                args = e.slice(String('setgg').length + 1, e.length).split(' ');
                await dbg.VariableOperations(args[0], args[2], args[1], 0, 2);
                break;

            case `setpg`:
                await dbg.pause();
                args = e.slice(String('setgg').length + 1, e.length).split(' ');
                await dbg.VariableOperations(args[0], args[2], args[1], 1, 0);
                break;

            case `setpp`:
                await dbg.pause();
                args = e.slice(String('setgg').length + 1, e.length).split(' ');
                await dbg.VariableOperations(args[0], args[2], args[1], 1, 1);
                break;

            case `setpa`:
                await dbg.pause();
                args = e.slice(String('setgg').length + 1, e.length).split(' ');
                await dbg.VariableOperations(args[0], args[2], args[1], 1, 2);
                break;

            case `setag`:
                await dbg.pause();
                args = e.slice(String('setgg').length + 1, e.length).split(' ');
                await dbg.VariableOperations(args[0], args[2], args[1], 2, 0);
                break;

            case `setap`:
                await dbg.pause();
                args = e.slice(String('setgg').length + 1, e.length).split(' ');
                await dbg.VariableOperations(args[0], args[2], args[1], 2, 1);
                break;

            case `setaa`:
                await dbg.pause();
                args = e.slice(String('setgg').length + 1, e.length).split(' ');
                await dbg.VariableOperations(args[0], args[2], args[1], 2, 2);
                break;

            case `render`:
                await dbg.pause();
                await dbg.Data(`"videoNextPage()"`);
                break;

            case 'help':
                console.log(helpText);
                break;
        }

        await Prompt(dbg);
    })
}

export function CONDebugger(target: string, PID: boolean, gdbLog: boolean, gdbErr: boolean) {
    debugger;
    const dbg = new GDBDebugger(!PID ? target : undefined, PID ? Number(target) : undefined, gdbLog, gdbErr);
    dbg.sendCommand(`info symbol main`).then(() => {
        if(dbg.buffer.includes('No symbol table is loaded')) {
            console.log('Eduke32 not loaded');
            process.exit(3);
        }

        console.log(helpText);
        Prompt(dbg);
    });
}