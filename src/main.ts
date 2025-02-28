import { CONDebugger } from './modules/debugger/debugger';

let path_or_PID = '';
let PID = false;
let gdb_log = false;
let gdb_err = false;

/*
    1 - don't put header in the CONs
    2 - don't create header file
    4 - create header file once
*/
let compile_options = 0;

console.log(`
\x1b[1;36mCON Debugger\x1b[0m
    BETA Version 0.60
    By ItsMarcos

\x1b[1;32mUse '-help' to get the list of commands\x1b[0m
`);

for(let i = 0; i < process.argv.length; i++) {
    const a = process.argv[i];

    //If enabled, it ignores all the other stuff
    if(a == '-bin') {
        const arg = process.argv[i + 1];
        if(arg.startsWith('PID=')) {
            PID = true;
            path_or_PID = arg.slice(4, arg.length);
        } else path_or_PID = arg;
    }

    if(a == `-log`)
        gdb_log = true;

    if(a == `-err`)
        gdb_err = true;

    if(a == '-help') {
        console.log(`Usage: \n\t-bin: EX: -bin eduke32.exe OR -bin PID=12345. Tells the debugger which PID or file is the Eduke32. \n\t-log: Enables the GDB logging. \n\t-err: Enables the Standard Err logging (use this if you wanna check the console logs for Eduke32)`)
        process.exit(0);
    }
}

if(path_or_PID == '')
    process.exit(0);

CONDebugger(path_or_PID, PID, gdb_log, gdb_err);
