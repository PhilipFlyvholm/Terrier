# Terrier [![Issues](https://img.shields.io/github/issues/PhilipFlyvholm/Terrier)](https://github.com/PhilipFlyvholm/Terrier/issues) [![MIT License](https://img.shields.io/github/license/PhilipFlyvholm/Terrier)](https://github.com/PhilipFlyvholm/Terrier/blob/master/LICENSE)

Terrier is a new web application compiler inspired by Svelte and Pug to give an alternative syntax to html while still having the benefits of a component based compiler.

## Current status

Terrier is currently not ready for use in production and is still missing key features for a MVP.

## Current goal

The current goal for an MVP is to implement the syntax described in the [specification](specification/idea.ter). The main priority is creating a compiler for SSR html with minimal Javascript.

### Feature/specification suggestions

Suggestions for new features or specification suggestion can be made by creating issues and describing the change in specification or possible new feature.

## Documentation

The syntax of terrier can be learned quickly with basic html knowledge.

### Creating a simple element

A element can be represented by writing the tag and a optional attributes.

```terrier
div class="container"
```

This will create a simple div with a container class.
There are multiple ways of creating children.

### Adding children

**Using new lines:**

By using a new line and then indenting with a tab then we can create a child. Each element with the same indent will have the same parent.

Example:

```Terrier
div class="container"
    h1 "Header 1"
    p
        "This is a paragraf.
        Strings can also be over multiple lines"
```

In the above example both the h1 and p elements have a string afterwards. These strings will be the child of the h1 and p elements.

**Using CSS-like syntax**

Inspired by CSS can you use `>`, `+` and `(...)` to define short and inline children for your elements. For example can the above example be shortened to:

```
div class="container" > (h1 "Header 1" + p "This is a paragraf.")
```

_Multiline strings are also supported here but not recommended for readability_

The `>` operation is a child operation and the next element after a child selctor will be a child of the current element.

The `+` operation is a sibling operation whichs adds a sibling to the previous element.

The `(...)` operation is a **fragment** which is wrapping content together. Fragments are needed if you want to have multiple children using the child operator. The previous example will not work as expected if you remove the fragment operator since it will return p as a sibling to the div.

### Comments

There are two types of comments. Either a block comment like in html `<!-- This is a comment -->` or an inline comment like in Javascript `//This is a inline comment`. The difference being that the inline comment can only be at the end of a line since everything to the right of `//` will be ignored while the block comment can be placed everywhere.

Comments are ignored by the compiler and will not be in the build files.

### A bit more about strings

Unlike html then all text needs to be a string like in Javascript. Meaning the text needs to be surrounded by either single or double quotes. This is needed to differentiate between a tag and a text string. String Interpolation is currently not supported but is in the MVP specification.
