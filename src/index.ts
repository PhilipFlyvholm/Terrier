import fs from "fs";
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
      parser.printStack();
    }
  );
};
await parserTest();
