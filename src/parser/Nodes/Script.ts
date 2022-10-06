import Node from "./Node";
import { parse as acornParse, Node as acornNode } from "acorn";
import { CompileOutput } from "../Interfaces";
export default class Script implements Node {
  public type: string;
  public begin: number;
  public src: acornNode;
  public rawSrc: string;

  constructor(begin: number, src: string) {
    this.type = "script";
    this.begin = begin;
    this.src = acornParse(src, {
      sourceType: "module",
      ecmaVersion: 2016,
    });
    this.rawSrc = src;
  }

  public render(compiled: CompileOutput): CompileOutput {
    compiled.script += this.rawSrc;
    return compiled;
  }
}
