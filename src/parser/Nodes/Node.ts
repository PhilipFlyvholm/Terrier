import { CompileOutput } from "../Interfaces";

export default interface Node {
  type: string;
  begin: number;
  render: (complied: CompileOutput) => CompileOutput;
}
