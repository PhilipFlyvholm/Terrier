import Element from "./Nodes/Element.js";
import Fragment from "./Nodes/Fragment.js";
import Node from "./Nodes/Node";

export default function compile(ast: Node): string | null {
  // ...
  switch (ast.type) {
    case "element":
      return Object.assign(new Element(ast.begin, "unknown", 0), ast).render();
    case "fragment":
      return Object.assign(new Fragment(ast.begin, 0), ast).render();
    default:
      console.log(ast.type);
      return null;
  }
}
