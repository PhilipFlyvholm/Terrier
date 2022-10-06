import { CompileOutput } from "./Interfaces";
import Node from "./Nodes/Node";

export default function compile(ast: Node): CompileOutput | null {
  // ...
  const compiled: CompileOutput = {
    html: "",
    script: "",
    style: "",
  };
  return ast.render(compiled);
}
