import Node from "./Node";
import Component from "../../runtime/TerrierComponent.js";

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

  public render(compiled: Component): Component {
    this.children.forEach((child) => {
      compiled = child.render(compiled);
    });
    return compiled;
  }
}
