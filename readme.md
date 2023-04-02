# Aria

## Installation

To use this project, you'll need to have Deno and Scoop installed on your system. You can install it by running:
### Scoop
`Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` # Optional: Needed to run a remote script the first time
`irm get.scoop.sh | iex`

### Deno
`scoop install deno`


## Features

- Dynamic Typing: You don't have to worry about data types, the interpreter does it for you!
- Easy, Consise syntax: Anyone can pick up this language and just go!
- A great community, if you ever need support, you can head to [the discord server](https://discord.gg/SeVJ3upQGq)

## Contributing

If you are interested in contributing to this project, you can follow these steps:

1. Fork this repository
2. Create a new branch (`git checkout -b feature/feature-name`)
3. Make your changes and commit them (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/feature-name`)
5. Create a new Pull Request

## License

This project is licensed under the [GNU Public 3.0 License](LICENSE).


# Basics
Aria is a simple language, it has concrete rules that never change.

### RPN
Aria uses RPN (Reverse Polish Notation), meaning the operator goes before the numbers
`(+ 1 2)` (3)
`(+ 2 (* 16 4))` (66)

### S-Expressions
Aria uses S-Expressions, meaning all functions & arguments are **within** the brackets.
`(print "Hello world!")`

### __End__

# Functions

Functions are an essential part of Lisp. They allow you to define and execute custom operations on data. Functions are defined using the `defun` special form.

## Defining Functions

The basic syntax for defining a function is as follows:
```clojure
(def name [args] (
  body))
```
For example, here's a function to square a number and return it!
```clojure
(def squre [n] (
  (* n n)))
```
This function takes an input of n, and returns n * n

# Macros
Aria also uses macros, which allow the function access to the AST (Abstract Syntax Tree), these will be explained in the docs, but here's an overview
Aria functions do not have varargs, but macros can, here's a macro to take multiple arguments and return the sum
```clj
(macro sum [args] (
  (var tr (eval (index args 0)))
  (remove args 0)
  (for i args (
    (var tr (+ tr (eval i)))))))
```
This might be alot to take in, the macro is defined by (macro <name> [args] (body))
  `(eval (index args 0))` calls index 0 of the args, i.e the first arg. evaluates it to get the number from it, and then removes the arg via `(remove args 0)`
  then, it itates through the args with a for loop and redefined tr as tr + the evaluated value of i.
The reason you must evaluate it is because the macro is reading the AST, and the eval function saves time calling the value from scope or extracting the value from its node. This will be explained more in the docs.
