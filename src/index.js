"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fs = require('fs');
const gelex = require('gelex');
const def = gelex.definition();
const isEmptyTag = require('./utils/emptyTags').isEmptyTag;
//KNOWN ISSUE: can't pass data-[bla] attributes
def.define("attribute", "[a-zA-Z\-]*=", function (value) {
    return value.substring(0, value.length - 1);
});
def.define("keyword", "[a-zA-Z][a-zA-Z0-9]*");
def.defineText("string", '"', '"');
def.defineText("string", "'", "'");
def.define("newline", "\n");
const printParseData = (parseData) => {
    console.log("Success:", parseData.success);
    console.log("Lines:", parseData.line);
    console.log("Tags:");
    if (!parseData.tags || parseData.tags.length == 0) {
        console.log("[]");
    }
    else {
        parseData.tags.forEach(element => {
            console.log(element);
        });
    }
};
const createTag = (tag, index) => {
    return {
        tag: tag,
        attributes: [],
        children: [],
        index: index,
        raw: ""
    };
};
const parseNewLine = (parseData, token) => {
    parseData.line++;
    parseData.relativePos = token.end;
    return parseData;
};
const parseImport = (parseData) => {
    let token = parseData.lexer.next();
    if (token == null) {
        console.log("Failed to parse import");
        parseData.success = false;
        return parseData;
    }
    if (token.type.toLowerCase() !== "keyword") {
        console.error(`Missing import alias on line ${parseData.line}`);
        parseData.success = false;
        return parseData;
    }
    let variable = token.value;
    token = parseData.lexer.next();
    if (token.type !== "keyword" || token.value.toLowerCase() !== "from") {
        console.error(`Invalid import: Missing "from" on line ${parseData.line}`);
        parseData.success = false;
        return parseData;
    }
    token = parseData.lexer.next();
    if (token.type !== "string" || token.value.trim() === "") {
        console.error(`Invalid import: Missing import path on line ${parseData.line}`);
        parseData.success = false;
        return parseData;
    }
    let path = token.value;
    //TODO: CHECK IF ALREADY DECLARED
    //TODO: IMPORT
    console.log(`Imported ${variable} from ${path}`);
    return parseData;
};
const parseAttributes = (parseData, tag) => {
    console.log("tag", tag);
    let currentPos = parseData.lexer.position();
    let token = parseData.lexer.next();
    if (token == null) {
        //No more attributes;
        parseData.lexer.seek(currentPos);
        return [parseData, tag];
    }
    switch (token.type) {
        case "attribute":
            let attribute = token.value;
            token = parseData.lexer.next();
            if (token.type !== "string") {
                console.log("Attributes need a string");
                parseData.success = false;
                return [parseData, tag];
            }
            let aValue = token.value;
            console.log("attribute", attribute, aValue);
            tag.attributes.push(`${attribute}="${aValue}"`);
            return parseAttributes(parseData, tag);
        case "newline":
            //No more attributes;
            parseData.lexer.seek(currentPos);
            return [parseData, tag];
        default:
            console.log(`Invalid syntax: ${token.type} not valid in tag element ${parseData.line}`);
            parseData.success = false;
            return [parseData, tag];
    }
};
const parseChildren = (parseData, tag) => {
    let currentPos = parseData.lexer.position();
    let token = parseData.lexer.next();
    if (token == null) {
        //No more attributes;
        parseData.lexer.seek(currentPos);
        return [parseData, tag];
    }
    let newIndex = token.begin - parseData.relativePos;
    switch (token.type) {
        case "keyword":
            if (newIndex <= tag.index) {
                //No more children;
                console.log("No more children");
                parseData.lexer.seek(currentPos);
                return [parseData, tag];
            }
            console.log("child");
            let child = createTag(token.value, newIndex);
            let childParse = parseTag(parseData, child);
            parseData = childParse[0];
            child = childParse[1];
            if (!parseData.success) {
                return [parseData, tag];
            }
            tag.children.push(child);
            return parseChildren(parseData, tag);
        case "string":
            if (newIndex <= tag.index) {
                //No more children;
                console.log("No more children");
                parseData.lexer.seek(currentPos);
                return [parseData, tag];
            }
            console.log("string child");
            let rawTag = createTag("raw", newIndex);
            rawTag.raw = token.value;
            tag.children.push(rawTag);
            return parseChildren(parseData, tag);
        case "newline":
            parseData = parseNewLine(parseData, token);
            return parseChildren(parseData, tag);
        default:
            console.log(`Invalid syntax: ${token.type} not valid in tag element ${parseData.line}`);
            parseData.success = false;
            return [parseData, tag];
    }
};
const parseTag = (parseData, tag) => {
    let attributeParse = parseAttributes(parseData, tag);
    parseData = attributeParse[0];
    tag = attributeParse[1];
    let token = parseData.lexer.next();
    if ((token === null || token === void 0 ? void 0 : token.type) !== "newline") {
        if (token == null) {
            //End of file
            return [parseData, tag];
        }
        parseData.success = false;
        console.log(`Invalid syntax: Missing new line after attributes ${parseData.line}`);
        return [parseData, tag];
    }
    parseData = parseNewLine(parseData, token);
    let childrenParse = parseChildren(parseData, tag);
    parseData = childrenParse[0];
    tag = childrenParse[1];
    return [parseData, tag];
};
const parse = (parseData) => {
    if (!parseData || !parseData.success) {
        console.log("Parse error");
        return parseData;
    }
    let token = parseData.lexer.next();
    if (token == null) {
        return parseData;
    }
    switch (token.type) {
        case "keyword":
            if (token.value.toLowerCase() === "import") {
                parseData = parseImport(parseData);
                break;
            }
            let tag = createTag(token.value, token.begin - parseData.relativePos);
            let tagParse = parseTag(parseData, tag);
            console.log("tagParse:", tagParse);
            parseData = tagParse[0];
            tag = tagParse[1];
            if (!parseData.success) {
                console.log("failed", parseData);
                return parseData;
            }
            if (tag != null)
                parseData.tags.push(tag);
            console.log("final: ", parseData);
            break;
        case "newline":
            parseData = parseNewLine(parseData, token);
            break;
        default:
            console.error(`${token.type} has not been implemented yet on line ${parseData.line}`);
            parseData.success = false;
            return parseData;
    }
    return parse(parseData);
};
const convertToHTML = (tags) => {
    let html = "";
    if (!tags)
        return html;
    tags.forEach(tag => {
        if (tag.raw && tag.tag === "raw") {
            html += tag.raw;
            return;
        }
        let children = tag.children;
        let attributes = tag.attributes.length == 0 ? "" : " " + tag.attributes.join(" ");
        if (children && children.length) {
            let childrenHTML = convertToHTML(children);
            html += `<${tag.tag}${attributes}>${childrenHTML}</${tag.tag}>`;
        }
        else if (isEmptyTag(tag.tag))
            html += `<${tag.tag}${attributes}/>`;
        else
            html += `<${tag.tag}${attributes}></${tag.tag}>`;
    });
    return html;
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield fs.readFile('./examples/index.ter', 'Utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const lexer = def.lexer(data);
        const parseData = {
            lexer: lexer,
            line: 1,
            relativePos: 0,
            success: true,
            tags: new Array()
        };
        let r = parse(parseData);
        printParseData(r);
        console.log("Result:", r);
        console.log(convertToHTML(r.tags));
    });
});
main();
