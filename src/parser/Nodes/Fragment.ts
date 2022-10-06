import Node from "./Node";
import { CompileOutput } from "../Interfaces";

export default class Fragment implements Node {
  public type: string;
  public begin: number;
  public indent: number;
  public children: Node[];

  constructor(begin: number, indent: number) {
    this.type = "fragment";
    this.begin = begin;
    this.indent = indent;
    this.children = [];
  }

  public render(compiled: CompileOutput): CompileOutput {
    this.children.forEach((child) => {
      compiled = child.render(compiled);
    });
    return compiled;
  }
}
