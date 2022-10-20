import { ParseOutput } from "../parser/Interfaces";
import Component from "../runtime/TerrierComponent.js";
import compileScript from './ScriptModification.js';

export default function compile(parse: ParseOutput): Component | null {
  // ...
  const c = new Component(parse.ast, parse.js, parse.style);
  compileScript(c);
  return c;
}
