import gelex from "gelex";
const def = gelex.definition();
def.define("attribute", "[a-zA-Z\-]*=", function (value) {
    return value.substring(0, value.length - 1);
});
def.define("keyword", "[a-zA-Z][a-zA-Z0-9]*");
def.defineText("string", '"', '"');
def.defineText("string", "'", "'");
def.define("newline", "\n");
export default function getLexer(data) {
    return def.lexer(data);
}
;
