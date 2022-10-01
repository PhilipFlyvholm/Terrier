interface IError {
    refCode: string,
    message: string
}

export function error(error: IError, line: number) {
    let msg = `${error.refCode}: ${error.message} (Line: ${line})`;
    throw new Error(msg);
}

export const ParseError = {
    invalid_usage: (type: string, value: string) => ({
        refCode: "invalid_usage",
        message: `Invalid usage of "${type}" types with value "${value}"`
    }),
    missing_start_delimiter: (specialType: string) => ({
        refCode: "missing_start_delimiter",
        message: `Missing start delimiter for "${specialType}"`
    }),
    unknown_type: (value: string) => ({
        refCode: "unknown_type",
        message: `Could not parse: "${value}" - Invalid syntax`
    }),
    arg_missing_value: {
        refCode: "missing_value",
        message: "Argument is missing string value"
    },
    multiple_elements_on_same_line: (type: string) => ({
        refCode: "invalid_syntax_multiple_elements",
        message: `Can't place an "${type}" element on same line`
    }),
    attribute_after_child: (attributeName: string) => ({
        refCode: "invalid_syntax_attribute_after_child",
        message: `Can't place an attribute "${attributeName}" after child element`
    }),
}