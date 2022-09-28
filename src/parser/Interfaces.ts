export interface Token {
    type: string,
    value: string,
    begin: number,
    end: number
}

export interface Lexer {
    position: () => number,
    next: () => Token,
    seek: (newposition: number) => void
    char: (char: string) => Token | null
}