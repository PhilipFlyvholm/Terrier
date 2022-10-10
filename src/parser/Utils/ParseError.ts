interface IError {
  refCode: string;
  message: string;
}

export function error(error: IError, line: number): void {
  const msg = `${error.refCode}: ${error.message} (Line: ${line})`;
  throw new Error(msg);
}

export const ParseError = {
  invalid_usage: (type: string, value: string) => ({
    refCode: "invalid_usage",
    message: `Invalid usage of "${type}" types with value "${value}"`,
  }),
  missing_start_delimiter: (type: string) => ({
    refCode: "missing_start_delimiter",
    message: `Missing start delimiter for "${type}"`,
  }),
  missing_end_delimiter: (type: string) => ({
    refCode: "missing_end_delimiter",
    message: `Missing end delimiter for "${type}"`,
  }),
  unknown_type: (value: string) => ({
    refCode: "unknown_type",
    message: `Could not parse: "${value}" - Invalid syntax`,
  }),
  arg_missing_value: {
    refCode: "missing_value",
    message: "Argument is missing string value",
  },
  multiple_elements_on_same_line: (type: string) => ({
    refCode: "invalid_syntax_multiple_elements",
    message: `Can't place an "${type}" element on same line`,
  }),
  attribute_after_child: (attributeName: string) => ({
    refCode: "invalid_syntax_attribute_after_child",
    message: `Can't place an attribute "${attributeName}" after child element`,
  }),
  attribute_without_element: (attributeName: string) => ({
    refCode: "invalid_syntax_attribute_without_element",
    message: `Can't place an attribute "${attributeName}" without element`,
  }),
  non_element_attribute: {
    refCode: "invalid_syntax_non_element_attribute",
    message: `Only elemenenets can have attributes`,
  },
};
