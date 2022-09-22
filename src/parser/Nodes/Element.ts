import Node from './Node';
import isEmptyTag from '../../utils/emptyTags.js';
import Attribute from './Attribute';

export default class Element implements Node {
    public type: string;
    public begin: number;
    public children: Node[];
    public tag: string;
    public attributes: Attribute[] = [];
    public is_self_closing = false;
    public indent: number;
    constructor(begin: number, tag: string, indent:number) {
        this.type = "element";
        this.begin = begin;
        this.children = [];
        this.tag = tag;
        this.is_self_closing = isEmptyTag(tag);
        this.indent = indent;
    }
    
}