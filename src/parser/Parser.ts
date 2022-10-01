import { Lexer, Token } from './Interfaces';
import { LexTypes, getLexer } from './Lexer.js';
import { parse as acornParse } from 'acorn';
import { error, ParseError } from './Utils/ParseError.js';
import CalculateLine from './Utils/CalculateLine.js';

import Element from './Nodes/Element.js';
import Attribute from './Nodes/Attribute.js';
import Text from './Nodes/Text.js';
import Fragment from './Nodes/Fragment.js';
import Node from './Nodes/Node';

export default class Parser {
    private lexer: Lexer;
    private line = {
        number: 1,
        startIndex: 0
    }
    public stack: Fragment[] = [];
    //private ast: Node | null;

    constructor(template: string) {
        this.lexer = getLexer(template);
        //this.ast = null;
        let token: Token;
        while (token = this.lexer.next()) {
            let type = token.type;
            let indent = this.calculateIndent(token);
            switch (type) {
                case LexTypes.Newline:
                    this.line = {
                        number: CalculateLine(template, token.end),
                        startIndex: token.end + 1
                    }
                    break;
                case LexTypes.Keyword:
                    if (this.getCurrent() && (this.getCurrent().type == "element" && !(this.getCurrent() as Element).is_inline) && this.line.number <= CalculateLine(template, this.getCurrent().begin) - 1) {
                        error(ParseError.multiple_elements_on_same_line(token.value), this.line.number);
                        return;
                    }
                    if (!this.newChild(indent)) return;
                    let element = new Element(token.begin, token.value, indent);
                    this.stack.push(element);
                    break;
                case LexTypes.Attribute:
                    let attributeName = token.value;
                    let attributeBegin = token.begin;
                    if (!this.getCurrent()) {
                        //error(ParseError.attribute_without_element(attributeName), this.line.number);
                        console.log("TODO: Implement error handling - attribute without element - Parser: 47");
                        return;
                    }
                    if (this.getCurrent().type !== "element") {
                        console.log("TODO: Implement error handling - non-elements can't have attributes - Parser: 51");
                        return;
                    }
                    if (this.getCurrent().children.length > 0) {
                        error(ParseError.attribute_after_child(attributeName), this.line.number);
                        return;
                    }
                    token = this.lexer.next();
                    if (token.type !== LexTypes.String) {
                        error(ParseError.arg_missing_value, this.line.number);
                        break;
                    }
                    let attributeValue = new Text(token.begin, token.value, true);
                    let attribute = new Attribute(attributeBegin, attributeName, attributeValue);
                    (this.getCurrent() as Element).attributes.push(attribute);
                    break;
                case LexTypes.String:
                    if (!this.newChild(indent)) return;
                    let value = token.value;
                    let stringElement = new Text(token.begin, value, true);
                    this.getCurrent().children.push(stringElement);
                    break;
                case LexTypes.Special:
                    if (token.value === "script") {
                        token = this.lexer.next();
                        if (token.type !== LexTypes.Delimiter && token.value !== "{") {
                            error(ParseError.missing_start_delimiter("script"), this.line.number);
                            break;
                        }
                        let depth = 1;
                        let scriptBegin = token.begin;
                        let scriptEnd = token.end;

                        while (depth != 0) {
                            let nextDelimiter = this.nextUntil("delimiter");
                            console.log(nextDelimiter);

                            if (nextDelimiter == null) {
                                //TODO ERROR
                                return;
                            }
                            if (nextDelimiter.value === "{") depth++;
                            else if (nextDelimiter.value === "}") {
                                depth--;
                                scriptEnd = nextDelimiter.end;
                            }
                        }
                        let script = template.substring(scriptBegin + 1, scriptEnd);
                        console.log(script);
                        let parsedScript = acornParse(script, { sourceType: 'module', ecmaVersion: 2016 })
                        console.log(parsedScript);
                        break;
                    }
                case LexTypes.Delimiter:
                    switch (token.value) {
                        case ">":
                            if (!this.getCurrent()) {
                                error(ParseError.invalid_usage(token.type, token.value), this.line.number);
                                return;
                            }
                            if (this.getCurrent().type !== "element") {
                                error(ParseError.invalid_usage(token.type, token.value), this.line.number);
                                return;
                            }
                            (this.getCurrent() as Element).is_inline = true;
                            break;
                        case "(":
                            let fragment = new Fragment(token.begin, indent);
                            this.stack.push(fragment);
                            break;
                        case ")":
                            if (!this.getCurrent()) {
                                console.log("here");

                                error(ParseError.invalid_usage(token.type, token.value), this.line.number);
                                return;
                            }
                            while (this.getCurrent().type !== "fragment") {
                                let current = this.stack.pop();
                                if (!this.getCurrent()) {
                                    error(ParseError.invalid_usage(token.type, token.value), this.line.number);
                                    return;
                                }
                                this.getCurrent().children.push(current as Node);
                            }
                            let current = this.stack.pop();
                            this.getCurrent().children.push(current as Node);
                            break;
                        case "+":
                            if (!this.getCurrent()) {
                                error(ParseError.invalid_usage(token.type, token.value), this.line.number);
                                return;
                            }
                            let sibling = this.stack.pop();
                            if (!this.getCurrent()) {
                                error(ParseError.invalid_usage(token.type, token.value), this.line.number);
                                return;
                            }
                            this.getCurrent().children.push(sibling as Node);
                            break;
                        default:
                            error(ParseError.invalid_usage(token.type, token.value), this.line.number);
                            break;
                    }
                    break;
                default:
                    if (token.type === "unknown") error(ParseError.unknown_type(token.value), this.line.number);
                    else error(ParseError.invalid_usage(token.type, token.value), this.line.number);
                    break;
            }
        }

        //Final stack clean up. 
        while (typeof this.stack[this.stack.length - 2] !== "undefined" &&
            this.stack[this.stack.length - 2].indent < this.getCurrent().indent) {
            let current = this.stack.pop();

            this.getCurrent().children.push(current as Node); //Force node type
        }
    }

    nextUntil = (type: string) => {
        let token = this.lexer.next();
        while (token !== null) {
            if (token.type == type) return token;
            token = this.lexer.next();
        }
        return null;
    }

    getCurrent = () => this.stack[this.stack.length - 1];

    newChild = (indent: number): boolean => {

        if (typeof this.getCurrent() === "undefined") return true;
        if (indent < this.getCurrent().indent) {
            //Grandparent or older scope
            //div
            //  h1
            //    span
            //    span
            //div <--
            while (indent <= this.getCurrent().indent) {
                let current = this.stack.pop();
                if (typeof current === "undefined") {
                    //TODO: Implement warning system
                    console.warn("WARNING: Invalid indent will assume indent 0");
                    return false;
                }
                if (typeof this.getCurrent() === "undefined") {
                    //rebuild stack
                    this.stack.push(current);
                    return true;
                }
                this.getCurrent().children.push(current as Element); //Force element type
            }
        } else if (indent === this.getCurrent().indent) {

            //Parent scope
            //div
            //  h1
            //    span
            //  div <--
            let current = this.stack.pop();
            if (typeof current === "undefined") {
                //TODO: Implement warning system
                console.warn("WARNING: Invalid indent will assume indent 0");
                return false;
            }
            if (typeof this.getCurrent() === "undefined" || indent === this.getCurrent().indent) {
                //rebuild stack
                this.stack.push(current);
                return true;
            }
            this.getCurrent().children.push(current as Element); //Force element type
        }
        return true;
    }

    calculateIndent = (token: Token): number => token.begin - this.line.startIndex


    printStack = () => {
        console.log(this.stack);
    }
}
