import { CompileOutput } from "../Interfaces";
import Node from "./Node";
import Text from "./Text";

export default class Attribute implements Node {
  public type: string;
  public begin: number;
  public name: string;
  public value: Text;

  constructor(begin: number, name: string, value: Text) {
    this.type = "attribute";
    this.begin = begin;
    this.name = name;
    this.value = value;
  }

  public render(complied: CompileOutput): CompileOutput {
    return complied;
  }

  public renderString(): string {
    return ` ${this.name}="${this.value.renderString()}"`;
  }
}
