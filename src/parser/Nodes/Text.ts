import Node from './Node';

export default class Text implements Node {
    public type: string;
    public begin: number;
    public text: string;
    public isEscaped: boolean;

    constructor(begin: number, text: string, escape: boolean) {
        this.type = "text";
        this.begin = begin;
        this.text = text;
        if (escape) this.text = this.escape_characters();
        this.isEscaped = escape;
    }

    escape_characters() {
        return this.text.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
    }
}