import isEmptyTag from "../../utils/emptyTags.js";
import Attribute from "./Attribute.js";
import Fragment from "./Fragment.js";
import Component from "../../runtime/TerrierComponent.js";
import Text from "./Text.js";

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

  private addScopeClass(compiled: Component): void {
    if (this.attributes.filter(a => a.name === "class").length !== 0) {
      this.attributes.filter(a => a.name === "class")[0].value.addString(` ${compiled.hash}`, true);
    } else {
      this.attributes.push(new Attribute(super.begin, "class", new Text(super.begin, compiled.hash, true)))
    }
  }

  public render(compiled: Component): Component {
    this.addScopeClass(compiled);

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
