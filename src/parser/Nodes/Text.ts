import Node from './Node';

export default class Text extends Node {
    public text: string;
    public isEscaped: boolean;

    constructor(begin: number, end: number, text: string, escape: boolean) {
        super('text', begin, end);
        this.text = text;
        if (escape) this.text = this.escape_characters();
        this.isEscaped = escape;
    }

    escape_characters() {
        return this.text.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
    }
}