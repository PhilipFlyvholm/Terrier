import { Lexer, Token } from './Interfaces';
import Node from "./Nodes/Node";
import { LexTypes } from './Lexer';
import Element from './Nodes/Element';
import Attribute from './Nodes/Attribute';
import { error, ParseError } from './Utils/ParseError';
import Text from './Nodes/Text';
export default class Parser {
    private lexer: Lexer;
    private line = {
        number: 0,
        startIndex: 0
    }
    private stack: Element[] = [];
    private ast: Node | null;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.ast = null;
        let token: Token;
        while (token = lexer.next()) {
            let type = token.type;
            let indent = token.begin - this.line.startIndex;
            if (indent < this.getCurrent().indent) {
                //Grandparent or older scope
                //div
                //  h1
                //    span
                //    span
                //div <--
                while (indent < this.getCurrent().indent) {
                    let current = this.stack.pop();
                    if (typeof current === undefined) {
                        //TODO: Implement warning system
                        console.warn("WARNING: Invalid indent will assume indent 0");
                        break;
                    }
                    this.getCurrent().children.push(current as Element); //Force element type
                }
            } else if (indent === this.getCurrent().indent) {
                //Parent scope
                //div
                //  h1
                //    span
                //  div <--
            } else {
                //Current scope
                //div
                //  h1
                //    span
                //    div <--
            }
            switch (type) {
                case LexTypes.Newline:
                    this.line = {
                        number: this.line.number++,
                        startIndex: token.end
                    }
                    break;
                case LexTypes.Keyword:
                    let element = new Element(token.begin, token.value, indent);
                    this.stack.push(element);
                    break;
                case LexTypes.Attribute:
                    let attributeName = token.value;
                    let attributeBegin = token.begin;
                    token = lexer.next();
                    if (token.type !== LexTypes.String) {
                        error(ParseError.arg_missing_value, this.line.number);
                        break;
                    }
                    let value = new Text(token.begin, token.value, true);
                    let attribute = new Attribute(attributeBegin, attributeName, value);
                    this.getCurrent().attributes.push(attribute);
                case LexTypes.String:

                default:
                    error(ParseError.unknown_type(type), this.line.number);
                    break;
            }
        }
    }

    getCurrent = () => this.stack[this.stack.length - 1];

}