import Node from "./Node";
import Text from "./Text";

export default class Attribute extends Node {
    public name: string;
    public value: Text;

    constructor(begin: number, end: number, name: string, value: Text) {
        super('attribute', begin, end);
        this.name = name;
        this.value = value;
    }
}