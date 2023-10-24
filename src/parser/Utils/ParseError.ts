import Fragment from "../Nodes/Fragment";

interface IError {
  refCode: string;
  message: string;
}

export class ParseError extends Error {
  location: { line: number; start: number; indent: number, startOnLine: number };
  msg: string;
  snippet: string;
  constructor(
    msg: string,
    location: { line: number; start: number; indent: number, startOnLine: number },
    snippet: string
  ) {
    super(`${msg} "Line: ${location.line} : ${location.startOnLine}`);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ParseError.prototype);
    this.location = location;
    this.name = "ParserError";
    this.msg = msg;
    this.snippet = snippet
  }
}

export class ErrorHandler {
  private readonly template: string;
  constructor(template: string) {
    this.template = template;
  }

  public error(error: IError, line: {
    number: number,
    startIndex: number,
  }, current: Fragment): void {
    const msg = `${error.refCode}: ${error.message}`;
    const location = {
      line: line.number,
      start: current.begin,
      indent: current.indent,
      startOnLine: current.begin-line.startIndex
    };
    const snippet = this.template.substring(line.startIndex).split(/\r\n|\r|\n/).splice(0, 3).map((line, index:number) => {
      const lineNumber = location.line + index;
      return `${lineNumber}: ${line}`;
    }
    ).join('\n');
    throw new ParseError(msg, location, snippet);
  }
}

export const ParseErrorMessages = {
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
