import fs from "fs";
import compile from "./compiler/Compiler.js";
import parse from "./parser/Parser.js";
const print = false;
const parserTest = async (): Promise<void> => {
  await fs.readFile(
    "./examples/index.ter",
    (err: NodeJS.ErrnoException | null, data: any) => {
      if (err !== null) {
        console.error(err);
        return;
      }
      const parser = parse(data.toString());
      // parser.printStack();
      if (parser.ast !== null) {
        const compiled = compile(parser);
        if (print) console.log(compiled);
      } else console.log("Failed parse");
    }
  );
};
await parserTest();
