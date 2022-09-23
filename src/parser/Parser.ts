import { Lexer, Token } from './Interfaces';
//import Node from "./Nodes/Node";
import { LexTypes } from './Lexer.js';
import Element from './Nodes/Element.js';
import Attribute from './Nodes/Attribute.js';
import { error, ParseError } from './Utils/ParseError.js';
import Text from './Nodes/Text.js';
export default class Parser {
    //private lexer: Lexer;
    private line = {
        number: 1,
        startIndex: 0
    }
    public stack: Element[] = [];
    //private ast: Node | null;

    constructor(lexer: Lexer) {
        //this.lexer = lexer;
        //this.ast = null;
        let token: Token;
        while (token = lexer.next()) {
            let type = token.type;
            let indent = this.calculateIndent(token);            
            switch (type) {
                case LexTypes.Newline:
                    this.line = {
                        number: this.line.number+1,
                        startIndex: token.end
                    }
                    break;
                case LexTypes.Keyword:
                    if(!this.newChild(indent)) return;
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
                    let attributeValue = new Text(token.begin, token.value, true);
                    let attribute = new Attribute(attributeBegin, attributeName, attributeValue);
                    this.getCurrent().attributes.push(attribute);
                    break;
                case LexTypes.String:
                    if(!this.newChild(indent)) return;
                    let value = token.value;
                    let stringElement = new Text(token.begin, value, true);
                    this.getCurrent().children.push(stringElement);
                    break;
                default:
                    error(ParseError.unknown_type(type), this.line.number);
                    break;
            }
        }
        //Final stack clean up. 
        while (typeof this.stack[this.stack.length-2] !== "undefined" &&
                this.stack[this.stack.length-2].indent <= this.getCurrent().indent) {
            let current = this.stack.pop();
            this.getCurrent().children.push(current as Element); //Force element type
        }
    }

    getCurrent = () => this.stack[this.stack.length - 1];

    newChild = (indent: number):boolean => {
        
        if(typeof this.getCurrent() === "undefined") return true;
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
                this.getCurrent().children.push(current as Element); //Force element type
            }
        } else if (indent === this.getCurrent().indent) {
            
            //Parent scope
            //div
            //  h1
            //    span
            //  div <--
            let current = this.stack.pop();
            if (typeof current === undefined) {
                //TODO: Implement warning system
                console.warn("WARNING: Invalid indent will assume indent 0");
                return false;
            }
            this.getCurrent().children.push(current as Element); //Force element type
        }
        return true;
    } 

    calculateIndent = (token:Token):number => token.begin - this.line.startIndex

    
    printStack = () => {
        console.log(this.stack);
    }
}
