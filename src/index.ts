import fs from 'fs';
import isEmptyTag from './utils/emptyTags.js';
import Parser from './parser/Parser.js';

interface ParseData {
  lexer: Lexer,
  line: number,
  relativePos: number,
  success: boolean,
  tags: Tag[]
}

interface Tag {
  tag: string,
  attributes: string[],
  children: Tag[],
  index: number,
  raw: string
}
interface Token {
  type: string,
  value: string,
  begin: number,
  end: number
}

interface Lexer {
  position: () => number,
  next: () => Token,
  seek: (newposition: number) => void
}

/*const printParseData = (parseData: ParseData) => {
  console.log("Success:", parseData.success);
  console.log("Lines:", parseData.line);
  console.log("Tags:");
  if (!parseData.tags || parseData.tags.length == 0) {
    console.log("[]")
  } else {
    parseData.tags.forEach(element => {
      console.log(element);
    });
  }
}*/

const createTag = (tag: string, index: number): Tag => {
  return {
    tag: tag,
    attributes: [],
    children: [],
    index: index,
    raw: ""
  }
}

const parseNewLine = (parseData: ParseData, token: Token) => {
  parseData.line++;
  parseData.relativePos = token.end;
  return parseData;
}

const parseImport = (parseData: ParseData) => {
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
}

const parseAttributes = (parseData: ParseData, tag: Tag): [ParseData, Tag] => {
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
}

const parseChildren = (parseData: ParseData, tag: Tag): [ParseData, Tag] => {
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
}

const parseTag = (parseData: ParseData, tag: Tag): [ParseData, Tag] => {
  let attributeParse = parseAttributes(parseData, tag);
  parseData = attributeParse[0];
  tag = attributeParse[1];
  let token = parseData.lexer.next();
  if (token?.type !== "newline") {
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
}

const parse = (parseData: ParseData): ParseData => {
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
      if (tag != null) parseData.tags.push(tag);
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

}

const convertToHTML = (tags: Tag[]) => {
  let html = "";
  if (!tags) return html;
  tags.forEach(tag => {
    if (tag.raw && tag.tag === "raw") { html += tag.raw; return; }

    let children = tag.children;
    let attributes = tag.attributes.length == 0 ? "" : " " + tag.attributes.join(" ");
    if (children && children.length) {
      let childrenHTML = convertToHTML(children);
      html += `<${tag.tag}${attributes}>${childrenHTML}</${tag.tag}>`;
    }
    else if (isEmptyTag(tag.tag)) html += `<${tag.tag}${attributes}/>`;
    else html += `<${tag.tag}${attributes}></${tag.tag}>`;
  });
  return html;
}

/*const main = async () => {
  await fs.readFile('./examples/index.ter', (err: any, data: any) => {
    if (err) {
      console.error(err);
      return;
    }

    const lexer = getLexer(data.toString());
    const parseData: ParseData = {
      lexer: lexer,
      line: 1,
      relativePos: 0,
      success: true,
      tags: new Array()
    }
    let r = parse(parseData);
    printParseData(r);
    console.log("Result:", r);
    console.log(convertToHTML(r.tags));
  });
}*/

const parserTest = async () => {
  await fs.readFile('./examples/index.ter', (err: any, data: any) => {
    if (err) {
      console.error(err);
      return;
    }
    const parser = new Parser(data.toString());
    parser.printStack();
  });
}
parserTest();