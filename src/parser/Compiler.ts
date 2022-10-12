import { CompileOutput, ParseOutput } from './Interfaces';

export default function compile(parse: ParseOutput): CompileOutput | null {
  // ...
  const compiled: CompileOutput = {
    html: "",
    script: parse.js,
    style: "",
  };
  return parse.ast.render(compiled);
}
