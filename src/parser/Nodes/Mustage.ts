import Node from "./Node";
import { CompileOutput } from "../Interfaces";

export default class Mustage implements Node {
    public type: string;
    public begin: number;
    public content: string;

    constructor(begin: number, content: string) {
        this.type = "mustage";
        this.begin = begin;
        this.content = content;
    }

    public render(compiled: CompileOutput): CompileOutput {
        return compiled;
    }
}
