import { Lexer } from './Interfaces';
import gelex from "gelex";
const def = gelex.definition();
def.define("attribute", "[a-zA-Z\-]*=", function (value: string) {
    return value.substring(0, value.length - 1);
});
def.define("keyword", "[a-zA-Z][a-zA-Z0-9]*");
def.defineText("string", '"', '"');
def.defineText("string", "'", "'");
def.define("newline", "\n");
def.define("delimiter", ['{', '}']);
def.define("special", "@[a-zA-Z][a-zA-Z]*",
    function (value: string) {
        return value.substring(1); // removing initial @
    });
def.defineComment('//');
def.defineComment('<!--','-->');

export enum LexTypes {
    Attribute = "attribute",
    Keyword = "keyword",
    String = "string",
    Newline = "newline",
    Special = "special",
    Delimiter = "delimiter"
}

export function getLexer(data: any): Lexer {
    return def.lexer(data);
};