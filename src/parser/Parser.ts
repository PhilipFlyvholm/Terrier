import { Lexer, Token } from "./Interfaces";
import { LexTypes, getLexer } from "./Lexer.js";
import { error, ParseError } from "./Utils/ParseError.js";
import CalculateLine from "./Utils/CalculateLine.js";

import Element from "./Nodes/Element.js";
import Attribute from "./Nodes/Attribute.js";
import Text from "./Nodes/Text.js";
import Fragment from "./Nodes/Fragment.js";
import Node from "./Nodes/Node";
import Script from "./Nodes/Script.js";

export default class Parser {
  private readonly lexer: Lexer;
  private readonly line = {
    number: 1,
    startIndex: 0,
  };

  public stack: Fragment[] = [];
  public warnings: string[] = [];
  public ast: Node | null;

  constructor(template: string) {
    this.lexer = getLexer(template);
    this.ast = null;
    let token: Token;
    while ((token = this.lexer.next()) !== null) {
      const type = token.type;
      const indent = this.calculateIndent(token);
      switch (type) {
        case LexTypes.Newline: {
          this.line = {
            number: CalculateLine(template, token.end),
            startIndex: token.end + 1,
          };
          break;
        }
        case LexTypes.Keyword: {
          if (
            this.getCurrent() != null &&
            this.getCurrent().type === "element" &&
            !(this.getCurrent() as Element).is_inline &&
            this.line.number <=
              CalculateLine(template, this.getCurrent().begin) - 1
          ) {
            error(
              ParseError.multiple_elements_on_same_line(token.value),
              this.line.number
            );
            return;
          }
          if (!this.newChild(indent)) return;
          const element = new Element(token.begin, token.value, indent);
          this.stack.push(element);
          break;
        }
        case LexTypes.Attribute: {
          const attributeName = token.value;
          const attributeBegin = token.begin;
          if (this.getCurrent() == null) {
            error(
              ParseError.attribute_without_element(attributeName),
              this.line.number
            );
            return;
          }
          if (this.getCurrent().type !== "element") {
            error(ParseError.non_element_attribute, this.line.number);
            return;
          }
          if (this.getCurrent().children.length > 0) {
            error(
              ParseError.attribute_after_child(attributeName),
              this.line.number
            );
            return;
          }
          token = this.lexer.next();
          if (token.type !== LexTypes.String) {
            error(ParseError.arg_missing_value, this.line.number);
            break;
          }
          const attributeValue = new Text(token.begin, token.value, true);
          const attribute = new Attribute(
            attributeBegin,
            attributeName,
            attributeValue
          );
          (this.getCurrent() as Element).attributes.push(attribute);
          break;
        }
        case LexTypes.String: {
          if (!this.newChild(indent)) return;
          const value = token.value;
          const stringElement = new Text(token.begin, value, true);
          this.getCurrent().children.push(stringElement);
          break;
        }
        case LexTypes.Special: {
          if (token.value === "script") {
            token = this.lexer.next();
            if (token.type !== LexTypes.Delimiter && token.value !== "{") {
              error(
                ParseError.missing_start_delimiter("script"),
                this.line.number
              );
              break;
            }
            let depth = 1;
            const scriptBegin = token.begin;
            let scriptEnd = token.end;

            while (depth !== 0) {
              const nextDelimiter = this.nextUntil("delimiter");
              console.log(nextDelimiter);

              if (nextDelimiter == null) {
                // TODO ERROR
                return;
              }
              if (nextDelimiter.value === "{") depth++;
              else if (nextDelimiter.value === "}") {
                depth--;
                scriptEnd = nextDelimiter.end;
              }
            }
            const scriptSrc = template.substring(scriptBegin + 1, scriptEnd);
            console.log(scriptSrc);
            const script = new Script(scriptBegin, scriptSrc);
            const scriptFragment = new Fragment(scriptBegin, indent);
            scriptFragment.children.push(script);
            this.stack.push(scriptFragment);
            break;
          }
          break;
        }
        case LexTypes.Delimiter: {
          switch (token.value) {
            case ">": {
              if (this.getCurrent() == null) {
                error(
                  ParseError.invalid_usage(token.type, token.value),
                  this.line.number
                );
                return;
              }
              if (this.getCurrent().type !== "element") {
                error(
                  ParseError.invalid_usage(token.type, token.value),
                  this.line.number
                );
                return;
              }
              (this.getCurrent() as Element).is_inline = true;
              break;
            }
            case "(": {
              const fragment = new Fragment(token.begin, indent);
              this.stack.push(fragment);
              break;
            }
            case ")": {
              if (this.getCurrent() == null) {
                console.log("here");

                error(
                  ParseError.invalid_usage(token.type, token.value),
                  this.line.number
                );
                return;
              }
              while (this.getCurrent().type !== "fragment") {
                const current = this.stack.pop();
                if (this.getCurrent() == null) {
                  error(
                    ParseError.invalid_usage(token.type, token.value),
                    this.line.number
                  );
                  return;
                }
                this.getCurrent().children.push(current as Node);
              }
              const current = this.stack.pop();
              this.getCurrent().children.push(current as Node);
              break;
            }
            case "+": {
              if (this.getCurrent() == null) {
                error(
                  ParseError.invalid_usage(token.type, token.value),
                  this.line.number
                );
                return;
              }
              const sibling = this.stack.pop();
              if (this.getCurrent() == null) {
                error(
                  ParseError.invalid_usage(token.type, token.value),
                  this.line.number
                );
                return;
              }
              this.getCurrent().children.push(sibling as Node);
              break;
            }
            default: {
              error(
                ParseError.invalid_usage(token.type, token.value),
                this.line.number
              );
              break;
            }
          }
          break;
        }
        default: {
          if (token.type === "unknown")
            error(ParseError.unknown_type(token.value), this.line.number);
          else
            error(
              ParseError.invalid_usage(token.type, token.value),
              this.line.number
            );
          break;
        }
      }
    }

    // Final stack clean up.
    while (
      typeof this.stack[this.stack.length - 2] !== "undefined" &&
      this.stack[this.stack.length - 2].indent < this.getCurrent().indent
    ) {
      const current = this.stack.pop();

      this.getCurrent().children.push(current as Node); // Force node type
    }
    if (this.stack.length > 1) {
      const fragment = new Fragment(0, 0);
      fragment.children = this.stack;
      this.ast = fragment;
    } else {
      this.ast = this.stack[0];
    }
  }

  nextUntil = (type: string): Token | null => {
    let token = this.lexer.next();
    while (token !== null) {
      if (token.type === type) return token;
      token = this.lexer.next();
    }
    return null;
  };

  getCurrent = (): Fragment => this.stack[this.stack.length - 1];

  newChild = (indent: number): boolean => {
    if (typeof this.getCurrent() === "undefined") return true;
    if (indent < this.getCurrent().indent) {
      // Grandparent or older scope
      // div
      //  h1
      //    span
      //    span
      // div <--
      while (indent <= this.getCurrent().indent) {
        const current = this.stack.pop();
        if (typeof current === "undefined") {
          this.addWarning("Invalid indent will assume indent 0");
          return false;
        }
        if (typeof this.getCurrent() === "undefined") {
          // rebuild stack
          this.stack.push(current);
          return true;
        }
        this.getCurrent().children.push(current as Element); // Force element type
      }
    } else if (indent === this.getCurrent().indent) {
      // Parent scope
      // div
      //  h1
      //    span
      //  div <--
      const current = this.stack.pop();
      if (typeof current === "undefined") {
        this.addWarning("Invalid indent will assume indent 0");
        return false;
      }
      if (
        typeof this.getCurrent() === "undefined" ||
        indent === this.getCurrent().indent
      ) {
        // rebuild stack
        this.stack.push(current);
        return true;
      }
      this.getCurrent().children.push(current as Element); // Force element type
    }
    return true;
  };

  calculateIndent = (token: Token): number =>
    token.begin - this.line.startIndex;

  private readonly addWarning = (warning: string): number =>
    this.warnings.push(`Warning: ${warning} (Line: ${this.line.number})`);

  printStack = (): void => {
    console.log(this.stack);
  };
}
