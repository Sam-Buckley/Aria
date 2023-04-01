// deno-lint-ignore-file
//function to throw error with colour and helpful message
function error(message: any, hint: any) {
  //console.log(message); with colour, then a new line and helpful message
  console.log("\x1b[31m%s\x1b[0m", message);
  console.log("\x1b[33m%s\x1b[0m", hint);
}
export default error;
