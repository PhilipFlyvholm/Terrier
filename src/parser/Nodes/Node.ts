export default interface Node {
  type: string;
  begin: number;
  render: () => string;
}
