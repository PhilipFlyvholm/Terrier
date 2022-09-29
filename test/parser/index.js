// @ts-ignore
import Parser from "../../build/parser/Parser.js";
import fs from 'fs';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Parser', function () {
    describe('#constructor', function () {
        fs.readdirSync(__dirname + '/cases').forEach(function (file) {
            const dir = fs.lstatSync(__dirname + '/cases/' + file);
            if (!dir.isDirectory()) return;
            it('should parse ' + file, function () {
                const input = fs.readFileSync(__dirname + '/cases/' + file + '/input.ter', 'utf8').replace(/\r/g, ''); //Windows be like: nEwLIne iS \r\n 
                if (!input) throw new Error('No input file found');
                const output = fs.readFileSync(__dirname + '/cases/' + file + '/output.json', 'utf8');
                if (!output) throw new Error('No output file found');

                const parser = new Parser(input);
                assert.ok(parser);
                assert.deepEqual(parser.stack, JSON.parse(output));
            });
        });
    });
});