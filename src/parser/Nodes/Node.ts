import Component from "../../runtime/TerrierComponent.js";

export default interface Node {
  type: string;
  begin: number;
  render: (complied: Component) => Component;
}
