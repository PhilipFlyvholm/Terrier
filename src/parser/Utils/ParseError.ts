interface IError {
    refCode: string,
    message: string
}

export function error(error:IError, line: number){
    let msg = `${error.refCode}: ${error.message} (Line: ${line})`;
    throw new Error(msg);
}

export const ParseError = {
    unknown_type: (type:string) => ({
        refCode: "unknown_type",
        message: `The type ${type} is unkown`
    }),
    arg_missing_value: {
        refCode: "missing_value",
        message: "Argument is missing string value"
    }
}