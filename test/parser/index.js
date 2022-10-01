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
            //if (file !== 'comment-line-test') return;
            const input = fs.readFileSync(__dirname + '/cases/' + file + '/input.ter', 'utf8').replace(/\r/g, ''); //Windows be like: nEwLIne iS \r\n 
            if (!input) throw new Error('No input file found');
            let outputLoc = __dirname + '/cases/' + file + '/output.json';
            let errorLoc = __dirname + '/cases/' + file + '/error.json'
            let shouldOutput = fs.existsSync(outputLoc);
            let shouldError = fs.existsSync(errorLoc);
            if (!shouldOutput && !shouldError) throw new Error(`No output or error file found for ${file}`);

            if (shouldOutput) {
                it('should parse ' + file, function () {
                    const output = fs.readFileSync(__dirname + '/cases/' + file + '/output.json', 'utf8');
                    if (!output) throw new Error(`Invaid output file for ${file}`);

                    const parser = new Parser(input);
                    assert.ok(parser);
                    //fs.writeFileSync(__dirname + '/cases/' + file + '/output-actual.json', JSON.stringify(parser.stack));
                    assert.deepEqual(parser.stack, JSON.parse(output));
                });
            } else {
                it('should fail ' + file, function () {
                    const error = fs.readFileSync(__dirname + '/cases/' + file + '/error.json', 'utf8');
                    if (!error) throw new Error(`Invaid error file for ${file}`);
                    assert.throws(() => { new Parser(input) }, JSON.parse(error));
                });
            }

        });
    });
});