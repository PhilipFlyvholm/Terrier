declare module "gelex";

interface Token {
    type: string,
    value: string,
    begin: number,
    end: number
}

interface Lexer {
    position: () => number,
    next: () => Token,
    seek: (newposition: number) => void
}