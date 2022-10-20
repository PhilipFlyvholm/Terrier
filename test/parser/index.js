// @ts-ignore
import parse from "../../build/parser/Parser.js";
import fs from "fs";
import assert from "assert";
import path from "path";
import { fileURLToPath } from "url";
import { describe, it } from "mocha";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Parser", function () {
  describe("#parse", function () {
    fs.readdirSync(__dirname + "/cases").forEach(function (file) {
      const dir = fs.lstatSync(__dirname + "/cases/" + file);
      if (!dir.isDirectory()) return;
      // if (file !== 'comment-line-test') return;
      const input = fs
        .readFileSync(__dirname + "/cases/" + file + "/input.ter", "utf8")
        .replace(/\r/g, ""); // Windows be like: nEwLIne iS \r\n
      if (!input) throw new Error("No input file found");
      const outputLoc = __dirname + "/cases/" + file + "/output.json";
      const errorLoc = __dirname + "/cases/" + file + "/error.json";
      const shouldOutput = fs.existsSync(outputLoc);
      const shouldError = fs.existsSync(errorLoc);
      if (!shouldOutput && !shouldError)
        throw new Error(`No output or error file found for ${file}`);

      if (shouldOutput) {
        it("should parse " + file, function () {
          const output = fs.readFileSync(
            __dirname + "/cases/" + file + "/output.json",
            "utf8"
          );
          if (!output) throw new Error(`Invaid output file for ${file}`);

          const parser = parse(input);
          assert.ok(parser);
          assert.equal(parser.warnings.length, 0);
          // fs.writeFileSync(__dirname + '/cases/' + file + '/output-actual.json', JSON.stringify(parser));
          const outputJson = JSON.parse(output);
          assert.deepEqual(parser.ast, outputJson.ast);
          assert.deepEqual(parser.js, outputJson.js);
          assert.deepEqual(parser.warnings, outputJson.warnings);
        });
      } else {
        it("should fail " + file, function () {
          const error = fs.readFileSync(
            __dirname + "/cases/" + file + "/error.json",
            "utf8"
          );
          if (!error) throw new Error(`Invaid error file for ${file}`);
          assert.throws(() => {
            // eslint-disable-next-line no-new
            parse(input);
          }, JSON.parse(error));
        });
      }
    });
  });
});
