export default class Node {
    public type: string;
    public begin: number;
    public end: number;
    public children: Node[];
    public parent: Node | null;
    
    constructor(type: string, begin: number, end: number) {
        this.type = type;
        this.begin = begin;
        this.end = end;
        this.children = [];
        this.parent = null;
    }
}