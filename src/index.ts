import fs from "fs";
import compile from "./parser/Compiler.js";
import Parser from "./parser/Parser.js";

const parserTest = async (): Promise<void> => {
  await fs.readFile(
    "./examples/short.ter",
    (err: NodeJS.ErrnoException | null, data: any) => {
      if (err !== null) {
        console.error(err);
        return;
      }
      const parser = new Parser(data.toString());
      // parser.printStack();
      if (parser.ast !== null) console.log(compile(parser.ast));
      else console.log("Failed parse");
    }
  );
};
await parserTest();
