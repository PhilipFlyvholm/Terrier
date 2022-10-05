import Node from "./Node";

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
}
