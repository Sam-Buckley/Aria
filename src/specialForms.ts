// deno-lint-ignore-file
// deno-lint-ignore-file no-unused-vars
const specialForms = Object.create(null);
import yeet from "./error.ts";
import { evaluate, runWithScope as ev } from "./base.ts";
import TopScope from "./scope.ts";

// deno-lint-ignore no-explicit-any
specialForms.test = function (args: any, scope: any) {
  console.log("specialForms are accesssible");
};
function run(args: any, scope: any) {
  let value = false;
  for (let arg of args) {
    value = evaluate(arg, scope);
  }
  return value;
}
specialForms.do = function (args: any, scope: any) {
  return run(args, scope);
};

specialForms.var = function (args: any, scope: any) {
  if (args.length != 2 || args[0].type != "Identifier") {
    if (args.length != 2) {
      yeet("Incorrect number of arguments", "var should have 2 arguments");
    }
    if (args[0].type != "Identifier") {
      yeet(
        "Incorrect type of argument",
        "var should have a word as the first argument",
      );
    }
    console.log();
    return;
  }
  let value = evaluate(args[1], scope);
  scope[args[0].value] = value;
  return value;
};
specialForms.def = function (args: any, scope: any) {
  if (args[0].type != "Identifier") {
    if (args[0].type != "Identifier") {
      yeet(
        "Incorrect type of argument",
        "def should have a word as the first argument",
      );
    }
    return console.log();
  }
  let params: any = [];
  let body: any;
  //name of function
  let name = args[0].value;
  //list of arguments
  let type = typeof args[1].value;
  if (type != "object") {
    let params = [];
    body = args[1]
  } else {
    params = args[1].value;
    body = args[2]
  }
  //body of function
  return scope[name] = function () {
    if (arguments.length != params.length) {
      yeet(
        "Incorrect number of arguments",
        "def should have " + params.length + " arguments",
      );
    }
    let localScope = Object.create(scope);
    for (let i = 0; i < arguments.length; i++) {
      localScope[params[i].value] = arguments[i];
    }
    return evaluate(body, localScope);
  };
};
specialForms.if = function (args: any, scope: any) {
  if (args.length != 3) {
    yeet("Incorrect number of arguments", "if should have 3 arguments");
  } else if (evaluate(args[0], scope) !== false) {
    return evaluate(args[1], scope);
  } else {
    return evaluate(args[2], scope);
  }
};
specialForms.while = function (args: any, scope: any) {
  if (args.length != 2) {
    return yeet("Incorrect number of arguments", "while should have 2 arguments");
  }
  let value = false;
  while (evaluate(args[0], scope) !== false) {
    value = evaluate(args[1], scope);
  }
  return value;
};
specialForms[`:=`] = function (args: any, scope: any) {
  if (args.length != 2) {
    return yeet("Incorrect number of arguments", ":= should have 2 arguments");
  }
  let value = evaluate(args[1], scope);
  let target = args[0];
  //redefine the target
  if (target.type == "Identifier") {
    if (Object.prototype.hasOwnProperty.call(scope, target.value)) {
      scope[target.value] = value;
    } else {
      return yeet("Undefined variable", "Variable " + target.value + " is not defined");
    }
   } else {
    return yeet("Incorrect type of argument", ":= should have a word or a get as the first argument");
  }
  return value;
};
specialForms.for = function (args: any, scope: any) {
	  if (args.length != 3) {		
      return yeet("Incorrect number of arguments", "for should have 4 arguments");
    }
    let varname = args[0].value;
    let start = evaluate(args[1], scope);
    let body = args[2];
    let _scope = Object.create(scope);
    for (let i in start) {
      _scope[varname] = start[i];
      var tr = evaluate(body, _scope);
    }
    return tr;
  }
//function to import a file into the current scope
specialForms.import = function (args: any, _scope: any) {
    if (args.length != 1) {
        yeet("Incorrect number of arguments", "import should have 1 argument");
    }
    let path = args[0].value;
    //set name to the file name without the extension
    let name = path.split("/").pop().split(".")[0];
    //chage the path to be relative to the file in which the import statement is
    const file: any = Deno.readTextFileSync(path);
    //create scope, which has the TopScope functions for maths, input and print
    let scope = Object.create({
        "+":TopScope["+"], "-":TopScope["-"], "*":TopScope["*"], "/":TopScope["/"], "==":TopScope["=="], "%":TopScope["%"], "<":TopScope["<"], ">":TopScope[">"], "<=":TopScope["<="], ">=":TopScope[">="], "!=":TopScope["!="], "&&":TopScope["&&"], "||":TopScope["||"],
        "print": TopScope.print, "input": TopScope.input
      })
    ev(file, scope)
    //iterate through scope, for each key, add it to the current scope but with <file name>.<key>
    for (const key in scope) {
        if (Object.prototype.hasOwnProperty.call(scope, key)) {
            const element: any = scope[key];
            _scope[name + "." + key] = element;
        }
    }
    return file;
}
//create a "using" which imports all files in a folder and merges them into the current scope with the folder name as a prefix
specialForms.using = function (args: any, _scope: any) {
    if (args.length != 1) {
		yeet("Incorrect number of arguments", "using should have 1 argument");
	}
	let path = args[0].value;
	//replace all "." with "/"
	path = path.replace(/\./g, "/");
	let name = path.split("/").pop();
	//set name to the file name without the extension
	//read the directory and get all the files
	path = "../aria/lib/" + path
	const files = Deno.readDirSync(path);
	//iterate through the files
	for (const file of files) {
		//create a new scope with the TopScope functions for maths, input and print
		let scope = Object.create({
			"+":TopScope["+"], "-":TopScope["-"], "*":TopScope["*"], "/":TopScope["/"], "==":TopScope["=="], "%":TopScope["%"], "<":TopScope["<"], ">":TopScope[">"], "<=":TopScope["<="], ">=":TopScope[">="], "!=":TopScope["!="], "&&":TopScope["&&"], "||":TopScope["||"],
			"print": TopScope.print, "input": TopScope.input
		})
		//if file is a directory, skip it
		if (file.isDirectory) {
			continue;
		}
		const to_read = path + "/" + file.name;
		//read the file
		const fl: any = Deno.readTextFileSync(to_read);
		//evaluate the file
		ev(fl, scope)
		//iterate through scope, for each key, add it to the current scope but with <file name>.<key>
		for (const key in scope) {
			if (Object.prototype.hasOwnProperty.call(scope, key)) {
				const element: any = scope[key];
				_scope[name + "." + key] = element;
			}
		}
	}
	return files;
}

//function to use a namespace
specialForms.use = function (args: any, scope: any) {
    if (args.length != 1) {
        yeet("Incorrect number of arguments", "use should have 1 argument");
    }
    ///take the namepsace, and for each item in scope, remove the namespace from the key
    let name = args[0].value;
    for (const key in scope) {
        if (Object.prototype.hasOwnProperty.call(scope, key)) {
            const element: any = scope[key];
            if (key.startsWith(name + ".")) {
                let new_key = key.replace(name + ".", "");
                scope[new_key] = element;
                delete scope[key];
            }
        }
    }
    return scope;
}

specialForms.concat = function (value: any, scope: Object) {
  let str = evaluate(value[0], scope);
  //iterate through the rest of the arguments
  for (let i = 1; i < value.length; i++) {
    str += evaluate(value[i], scope);
  }
  return str;
};

specialForms.parse = function (value: any, scope: Object) {
	return parseFloat(evaluate(value[0].value, scope));
};
specialForms.int = function (value: any, scope: Object) {
	return Math.floor(evaluate(value[0], scope));
};
specialForms.index = function (value: any, scope: Object) {
  let arr = evaluate(value[0], scope);
  let index = evaluate(value[1], scope);
  return arr[index];
};
specialForms.length = function (value: any, scope: Object) {
  let arr = evaluate(value[0], scope);
  return arr.length;
};
specialForms.push = function (value: any, scope: Object) {
  let arr = evaluate(value[0], scope);
  let val = evaluate(value[1], scope);
  arr.push(val);
  return arr;
};
specialForms.remove   = function (value: any, scope: Object) {
  let arr = evaluate(value[0], scope);
  let index = evaluate(value[1], scope);
  arr.splice(index, 1);
  return arr;
};

export default specialForms;
