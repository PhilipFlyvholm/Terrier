import Component from "../../runtime/TerrierComponent.js";
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
    if (escape) this.text = this.escape_characters(this.text);
    this.isEscaped = escape;
  }

  public addString(text: string, escape: boolean):void{
    this.text += escape ? this.escape_characters(text) : text;
  }

  private escape_characters(string:string): string {
    return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  public render(complied: Component): Component {
    complied.html += this.renderString();
    return complied;
  }

  public renderString(): string {
    return this.text;
  }
}
