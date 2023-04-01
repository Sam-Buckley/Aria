// deno-lint-ignore-file
//import the top scope
import TopScope from "./scope.ts";
import specialForms from "./specialForms.ts";
import yeet from "./error.ts";
// deno-lint-ignore-file no-explicit-any no-explicit-any no-explicit-any
//create a function to lex the input into tokens
function lex(input: string) {
  const tokens = [];
  let current = 0;
  while (current < input.length) {
    let char = input[current];
    if (char === "(") {
      tokens.push({
        type: "paren",
        value: "(",
      });
      current++;
      continue;
    }
    if (char === ")") {
      tokens.push({
        type: "paren",
        value: ")",
      });
      current++;
      continue;
    }
    if (char === "[") {
      tokens.push({
        type: "paren",
        value: "[",
      });
      current++;
      continue;
    }
    if (char === "]") {
      tokens.push({
        type: "paren",
        value: "]",
      });
      current++;
      continue;
    }
    const WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }
    const NUMBERS = /[0-9-.]/;
    if (NUMBERS.test(char)) {
      let value = "";
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: "number",
        value,
      });
      continue;
    }
    if (char === '"') {
      let value = "";
      char = input[++current];
      while (char !== '"') {
        value += char;
        char = input[++current];
      }
      char = input[++current];
      tokens.push({
        type: "string",
        value,
      });
      continue;
    }
    const LETTERS = /[a-z-._]/i;
    if (LETTERS.test(char)) {
      let value = "";
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: "name",
        value,
      });
      continue;
    }
    //create operators, + - * / % ^ ! = < > & | ~
    const OPERATORS = /[+\-*\/%&|^~!=<>:]/;
    if (OPERATORS.test(char)) {
      let value = "";
      while (OPERATORS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: "operator",
        value,
      });
      continue;
    }
    throw new TypeError("I dont know what this character is: " + char);
  }
  return tokens;
}
//class to create the tree
enum NodeType {
  NumberLiteral = "NumberLiteral",
  StringLiteral = "StringLiteral",
  Identifier = "Identifier",
}
class ASTNode {
  type: string;
  value: any;
  constructor(type: string, value: string) {
    this.type = type;
    this.value = value;
  }
}
class ListNode {
  type: string;
  value: any[];
  constructor(value: any[]) {
    this.value = value;
    this.type = "ListNode";
  }
}
class FunctionCall {
  name: string;
  args: any[];
  type: string;
  constructor(name: string, args: any[]) {
    this.name = name;
    this.args = args;
    this.type = "FunctionCall";
  }
}
class AST {
  type: string;
  body: any[];
  constructor(type: string, body: any[]) {
    this.type = type;
    this.body = body;
  }
}
//create a function to parse the tokens into the AST class
function parser(tokens: any[]) {
  let current = 0;
  function walk() {
    let token = tokens[current];
    if (token.type === "number") {
      current++;
      return new ASTNode(NodeType.NumberLiteral, token.value);
    }
    if (token.type === "string") {
      current++;
      return new ASTNode(NodeType.StringLiteral, token.value);
    }
    if (token.type === "paren" && token.value === "(") {
      token = tokens[++current];
	  if (token.value === "(") {
		const node = new FunctionCall("do", []);
		while (
		  token.type !== "paren" ||
		  (token.type === "paren" && token.value !== ")")
		) {
		  node.args.push(walk());
		  token = tokens[current];
		}
		current++;
		return node;
	  }
      const node = new FunctionCall(token.value, []);
      token = tokens[++current];
      while (
        token.type !== "paren" ||
        (token.type === "paren" && token.value !== ")")
      ) {
        node.args.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }
    //tuples and lists enclosed in square brackets
    if (token.type === "paren" && token.value === "[") {
      const node = new ListNode([]);
      token = tokens[++current];
      while (
        token.type !== "paren" ||
        (token.type === "paren" && token.value !== "]")
      ) {
        node.value.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }
    if (token.type === "name") {
      current++;
      return new ASTNode(NodeType.Identifier, token.value);
    }
    throw new TypeError(token.type);
  }
  const ast = new AST("Program", []);
  while (current < tokens.length) {
    ast.body.push(walk());
  }
  return ast;
}
//write a function to evaluate an expression
function evaluate(node: any, scope: any) {
  if (node.type === NodeType.NumberLiteral) {
    return Number(node.value);
  }
  if (node.type === NodeType.StringLiteral) {
    return node.value;
  }
  if (node.type === NodeType.Identifier) {
    return scope[node.value];
  }
  if (node.type === "FunctionCall") {
    if (node.name in TopScope) {
      const args = node.args.map((arg: any) => evaluate(arg, scope));
      const func = scope[node.name];
      if (func == undefined) {
        yeet("Function not defined", node.name);
        Deno.exit(1)
      }
      return func(...args);
    }
  }
  if (node.name in specialForms) {
    let res = specialForms[node.name](node.args, scope);
	return res
  }
  if (node.type === "ListNode") {
    return node.value.map((arg: any) => evaluate(arg, scope));
  }
}
//create a function to lex, then parse, then for each tree in the ast, evaluate it
function run(input: string) {
  const tokens = lex(input);
  const ast = parser(tokens);
  const newAst = ast.body.map((node: any) => evaluate(node, TopScope));
  return newAst;
}
function runWithScope(input: string, scope: any) {
  const tokens = lex(input);
  const ast = parser(tokens);
  const newAst = ast.body.map((node: any) => evaluate(node, scope));
  return newAst
}
//function import run, to import files, create a new scope, and run the file, then merge the scopes but to not overwrite the original scope
//and to add <name>.<key> to the scope instead of just <key>

//export evaluate and run
export { evaluate, run, lex, parser, runWithScope };
