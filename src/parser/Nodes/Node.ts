export default interface Node {
    type: string;
    begin: number;
    children: Node[];
}