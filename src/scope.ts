// deno-lint-ignore-file no-explicit-any
const TopScope = Object.create(null);
TopScope.true = true;
TopScope.false = false;
TopScope.print = function (value: any) {
  console.log(value);
  return value;
};
for (const op of ["+", "-", "*", "/", "==", "%", "<", ">", "<=", ">=", "!=", "&&", "||"]) {
  TopScope[op] = new Function("a", "b", `return a ${op} b;`);
}
TopScope.input = function (value: any) {
  if (!value) value = "";
  return prompt(value);
};
export default TopScope;
