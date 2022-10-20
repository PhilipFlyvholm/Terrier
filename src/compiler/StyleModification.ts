import TerrierComponent from '../runtime/TerrierComponent';
import {
  parse,
  walk,
  fromPlainObject,
  generate,
  CssNode,
  ListItem,
  List,
} from "css-tree";

export const scopeStyle = (component: TerrierComponent): void => {
  const parsed = parse(component.style);
  let inPseudo = false;
  const classSelector = fromPlainObject({
    type: "ClassSelector",
    name: component.hash,
  });
  walk(parsed, {
    enter(node: CssNode, item: ListItem<CssNode>, _list: List<CssNode>) {
      switch (node.type) {
        case "PseudoClassSelector": {
          inPseudo = true;
          if (node.name === "global") {
            node.children?.forEach((n) => {
              if (n.type === "Raw") {
                item.data = parse(n.value, { context: "selector" });
              }
            });
          }
          break;
        }
        case "Selector": {
          if (inPseudo) return;

          const children = node.children;
          children.forEach((n, item, _list) => {
            if (
              n.type !== "Combinator" &&
              !(n.type === "PseudoClassSelector" && n.name === "global")
            )
              return;
            const prev = item.prev?.data;
            if (
              prev === undefined ||
              prev.type === "Combinator" ||
              (prev.type === "PseudoClassSelector" && prev.name === "global")
            )
              return;

            children.insertData(classSelector, item);
          });
          const last = node.children.last;
          if (
            !(last?.type === "PseudoClassSelector" && last?.name === "global")
          ) {
            node.children.push(classSelector);
          }
          break;
        }
        default: {
          break;
        }
      }
    },
    leave(node: CssNode) {
      switch (node.type) {
        case "PseudoClassSelector": {
          inPseudo = false;
          break;
        }
        default: {
          break;
        }
      }
    },
  });
  const generated = generate(parsed);
  component.style = generated;
};
