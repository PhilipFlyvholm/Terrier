import { CompileOutput } from "../Interfaces";
import Node from "./Node";

export default class Text implements Node {
  public type: string;
  public begin: number;
  public text: string;
  public isEscaped: boolean;

  constructor(begin: number, text: string, escape: boolean) {
    this.type = "text";
    this.begin = begin;
    this.text = text;
    if (escape) this.text = this.escape_characters();
    this.isEscaped = escape;
  }

  private escape_characters(): string {
    return this.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  public render(complied: CompileOutput): CompileOutput {
    complied.html += this.renderString();
    return complied;
  }

  public renderString(): string {
    return this.text;
  }
}
