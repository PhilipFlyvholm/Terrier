import { ParseOutput } from "../parser/Interfaces";
import Component from "../runtime/TerrierComponent.js";
import { compileScript } from "./ScriptModification.js";
import { scopeStyle } from "./StyleModification.js";

export default function compile(parse: ParseOutput): string | null {
  // ...
  const c = new Component(parse.ast, parse.js, parse.style);
  compileScript(c);
  scopeStyle(c);
  const injectStyle = c.style.trim() !== "" ? `document.getElementsByTagName('head')[0].innerHTML += '<style id="${c.hash}">${c.style}</style>';` : "";
  return `${injectStyle}${c.script} export default \`${c.html}\`;`;
}
