import isEmptyTag from "../../utils/emptyTags.js";
import Attribute from "./Attribute";
import Fragment from "./Fragment.js";

export default class Element extends Fragment {
  public tag: string;
  public attributes: Attribute[] = [];
  public is_self_closing = false;
  public is_inline = false;

  constructor(begin: number, tag: string, indent: number) {
    super(begin, indent);
    super.type = "element";
    this.tag = tag;
    this.is_self_closing = isEmptyTag(tag);
  }

  public render(): string {
    const attributes = this.attributes.map((attr) => attr.render()).join("");
    const children = this.is_self_closing
      ? ""
      : this.children.map((child) => child.render()).join("");
    return this.is_self_closing
      ? `<${this.tag}${attributes}/>`
      : `<${this.tag}${attributes}>${children}</${this.tag}>`;
  }
}
