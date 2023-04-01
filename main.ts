//import language/lpe.ts
import { run } from "./aria/base.ts";
import format from "./aria/formatter.ts";
//this is a cli for aria
//you can either run a file, start a repl, or format a file
//deno run --allow-read --allow-write --allow-net --allow-env --allow-run --unstable main.ts
const commands: string[] = ["run", "eval", "exec", "repl", "cli", "format", "fmt", "format-file"];
const args: string[] = Deno.args;
//check if args[0] isn't a command
//if not, print help
if (!commands.includes(args[0])) {
    console.log(
        `Aria is a programming language.
        RUN: aria run <file>
        REPL: aria repl
        FORMAT: aria format <file>`,
    );
    Deno.exit(0);
}
//if args[0] is run, run the file
if (args[0] == "run" || args[0] == "eval" || args[0] == "exec") {
    //if no file footer, set the footer to .aria
    let n = args[1];
    if (!(n.includes("."))) {
        n += ".aria";
    }
    const file = await Deno.readTextFile(n);
    //get the start time
    const start = Date.now();
    run(file);
    //get the end time
    const end = Date.now();
    //log the time it took to run the file
    console.log(`%cTook ${end - start}ms to run ${n}`, "color: green");
}
//if args[0] is repl, start a repl
if (args[0] == "repl" || args[0] == "cli") {
    //infinitely prompt for input
    while (true) {
        const input = prompt(">>> ");
        if (input == null) {
            break;
        }
        run(input);
    }
}
//if args[0] is format, format the file using clojure's formatting
if (args[0] == "format" || args[0] == "fmt" || args[0] == "format-file") {
    const file = await Deno.readTextFile(args[1]);
    const formatted = format(file);
    //console log in green success
    console.log(`%cSuccessfully formatted ${args[1]}`, "color: green");
    await Deno.writeTextFile(args[1], formatted);
}