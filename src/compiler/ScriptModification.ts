import TerrierComponent from '../runtime/TerrierComponent';
import { parse as acornParse, Node as acornNode } from "acorn";
import { walk as walkJS } from "estree-walker";

export default function compileScript(component: TerrierComponent): void {
    const script = component.script;
    const scriptNode: acornNode = acornParse(script, {
        ecmaVersion: 2022,
        sourceType: "module",
    });
    const imports: Array<{ literal: string; source: string }> = [];
    const variables: { const: string[]; let: string[]; var: string[] } = {
        const: [],
        let: [],
        var: [],
    };
    walkJS(scriptNode, {
        enter(node, _parent, _prop, _index) {
            switch (node.type) {
                case "Program": {
                    break;
                }
                case "ImportDeclaration": {
                    if (node.specifiers.length === 0) break;
                    const source = node.source.value;
                    for (let i = 0; i < node.specifiers.length; i++) {
                        const literal = node.specifiers[i].local.name;
                        imports.push({ literal, source });
                    }
                    break;
                }
                case "VariableDeclaration": {
                    switch (node.kind) {
                        case "const": {
                            for (let i = 0; i < node.declarations.length; i++) {
                                const declaration = node.declarations[i];
                                const name: string = declaration.id.name;
                                variables.const.push(name);
                            }
                            break;
                        }
                        case "let": {
                            for (let i = 0; i < node.declarations.length; i++) {
                                const declaration = node.declarations[i];
                                const name: string = declaration.id.name;
                                variables.let.push(name);
                            }
                            break;
                        }
                        case "var": {
                            for (let i = 0; i < node.declarations.length; i++) {
                                const declaration = node.declarations[i];
                                const name: string = declaration.id.name;
                                variables.var.push(name);
                            }
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                    break;
                }
                case "FunctionDeclaration": {
                    const functionBody = node.body;
                    switch (functionBody.type) {
                        case "BlockStatement": {
                            const blockBody = functionBody.body;
                            for (let n = 0; n < blockBody.length; n++) {
                                const statement = blockBody[n];
                                switch (statement.type) {
                                    case "ExpressionStatement": {
                                        const expression = statement.expression;
                                        switch (expression.type) {
                                            case "AssignmentExpression": {
                                                const {left, right, operator} = expression;
                                                if(left.type !== "Identifier"){
                                                    const type:string = left.type;
                                                    const pos:string = left.start;
                                                    throw Error(`Unknown type for Assignment ${type} @ ${pos}`); // TODO: Remove/fix before 1.0
                                                }
                                                const variableName = left.name;
                                                const isGlobalVariable = 
                                                    variables.const.includes(variableName)
                                                    || variables.var.includes(variableName)
                                                    || variables.let.includes(variableName);
                                                console.log(expression, isGlobalVariable, right);
                                                console.log(variableName,operator, script.substring(right.start, right.end));
                                                
                                                break;
                                            }
                                            default: {
                                                break;
                                            }
                                        }
                                        break;
                                    }
                                    default: {
                                        console.log("Unknown statement: ", statement.type); // TODO: Remove/fix before 1.0

                                        break;
                                    }
                                }
                            }

                            break;
                        }
                        default: {
                            break;
                        }
                    }
                    break;
                }
                default: {
                    console.log(node.type);

                    this.skip();
                    break;
                }
            }
            // some code happens
        },
    });
    component.imports = imports;
    component.variables = variables;
};