import isEmptyTag from "../../utils/emptyTags.js";
import Attribute from "./Attribute";
import Fragment from "./Fragment.js";
import { CompileOutput } from "../Interfaces";

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

  public render(compiled: CompileOutput): CompileOutput {
    const attributes = this.attributes
      .map((attr) => attr.renderString())
      .join("");
    if (this.is_self_closing) compiled.html += `<${this.tag}${attributes}/>`;
    else {
      compiled.html += `<${this.tag}${attributes}>`;
      this.children.forEach((child) => {
        compiled = child.render(compiled);
      });
      compiled.html += `</${this.tag}>`;
    }
    return compiled;
  }
}
