// @ts-ignore
import Parser from "../../build/parser/Parser.js";
import { getLexer } from "../../build/parser/Lexer.js";
import fs from 'fs';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

describe('Parser', function () {
    describe('#constructor', function () {
        fs.readdirSync(__dirname + '/cases').forEach(function (file) {
            const dir = fs.lstatSync(__dirname + '/cases/' + file);
            if (!dir.isDirectory()) return;
            it('should parse ' + file, function () {
                const input = fs.readFileSync(__dirname + '/cases/' + file + '/input.ter', 'utf8');
                if (!input) throw new Error('No input file found');
                const output = fs.readFileSync(__dirname + '/cases/' + file + '/output.json', 'utf8');
                if (!output) throw new Error('No output file found');

                const lexer = getLexer(input);
                const parser = new Parser(lexer);
                assert.ok(parser);
                assert.deepEqual(parser.stack, JSON.parse(output));
            });
        });
        /*it('should pass simply html tag', function () {
            const lexer = getLexer("html");
            const parser = new Parser(lexer);
            assert.equal(JSON.stringify(parser.stack), JSON.stringify([new Element(0, "html", 0)]));
        });*/
    });
});