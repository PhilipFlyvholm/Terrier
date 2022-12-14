// @ts-ignore
import compile from "../../build/compiler/Compiler.js";
import parse from "../../build/parser/Parser.js";
import fs from "fs";
import assert from "assert";
import path from "path";
import { fileURLToPath } from "url";
import { describe, it } from "mocha";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Compiler", function () {
  describe("#compile", function () {
    fs.readdirSync(__dirname + "/cases").forEach(function (file) {
      const dir = fs.lstatSync(__dirname + "/cases/" + file);
      if (!dir.isDirectory()) return;
      // if (file !== 'comment-line-test') return;
      const input = fs.readFileSync(
        __dirname + "/cases/" + file + "/input.ter",
        "utf8"
      );
      if (!input) throw new Error("No input file found");
      const outputLoc = __dirname + "/cases/" + file + "/output.js";
      const errorLoc = __dirname + "/cases/" + file + "/error.json";
      const shouldOutput = fs.existsSync(outputLoc);
      const shouldError = fs.existsSync(errorLoc);
      if (!shouldOutput && !shouldError)
        throw new Error(`No output or error file found for ${file}`);

      if (shouldOutput) {
        it("should compile " + file, function () {
          const output = fs.readFileSync(outputLoc, "utf8");
          if (!output) throw new Error(`Invaid output file for ${file}`);
          const parsed = parse(input);
          const compiled = compile(parsed);
          // fs.writeFileSync(__dirname + '/cases/' + file + '/output.js', compiled);
          assert.equal(compiled, output);
        });
      } else {
        it("should fail " + file, function () {
          const error = fs.readFileSyncn(errorLoc, "utf8");
          if (!error) throw new Error(`Invaid error file for ${file}`);
          assert.throws(() => {
            compile(JSON.parse(input));
          }, JSON.parse(error));
        });
      }
    });
  });
});
