/* eslint-disable @typescript-eslint/prefer-readonly */
import Node from "../parser/Nodes/Node";
import hash from "../utils/Hash.js";

export default class TerrierComponent {
  public html: string;
  public script: string;
  public style: string;
  public imports: Array<{ literal: string; source: string }>;
  public hash: string;
  public variables: { const: string[]; let: string[]; var: string[] } = {
    const: [],
    let: [],
    var: [],
  };

  constructor(ast: Node, script: string, style: string) {
    this.html = "";
    this.script = script;
    this.style = style;
    this.hash = "terrier-" + hash(style);
    this.imports = [];
    ast.render(this);
  }
}
