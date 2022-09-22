import Node from './Node';
import isEmptyTag from '../../utils/emptyTags.js';
import Attribute from './Attribute';

export default class Element extends Node {
    public tag: string;
    public attributes: Attribute[] = [];
    public is_self_closing = false;

    constructor(begin: number, end: number, tag: string) {
        super('element', begin, end);
        this.tag = tag;
        this.is_self_closing = isEmptyTag(tag);
    }
}