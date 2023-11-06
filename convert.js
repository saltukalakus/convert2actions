const parser = require("@babel/parser");
const generator = require("@babel/generator");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");

function convert(code) {
  const ast = parser.parse(code);

  
  let firstParamName, secondParamName, thirdParamName = "";
  let paramCount = 0;

  // Get function parameters;
  traverse(ast, {
    FunctionDeclaration(path) {
      // Check if the function has a parent node
      if (!path.parentPath.isProgram()) {
        // Skip this function if it's not in the top-level of the program
        return;
      }
      if (path.node.params.length === 3){
        firstParamName = path.node.params[0].name;
        secondParamName = path.node.params[1].name;
        thirdParamName = path.node.params[2].name;
      } 
      paramCount = path.node.params.length;
    },
  });

  if (paramCount !== 3){
    return "The rule should have three parameters. Please correct this and retry!";
  }

  // Convert callbacks


  // Convert "user" attribute of a rule
  traverse(ast, {
    FunctionDeclaration(path) {
      // Check if the function has a parent node
      if (!path.parentPath.isProgram()) {
        // Skip this function if it's not in the top-level of the program
        return;
      }

      if (path.node.params.length > 0) {
        // Create an assignment statement to convert the first parameter
        const assignmentStatement = t.variableDeclaration("let", [
          t.variableDeclarator(
            t.identifier(firstParamName),
            t.memberExpression(
              t.identifier("event"),
              t.identifier("user")
            )
          ),
        ]);

        // Insert the assignment statement at the beginning of the function's body
        path.get("body").unshiftContainer("body", assignmentStatement);
      }
    },
  });

  // Convert "context" attribute of a rule that traslates to event


  // Convert function signature
  traverse(ast, {
    FunctionDeclaration(path) {
        if (!path.parentPath.isProgram()) {
          // Skip this function if it's not in the top-level of the program
          return;
        }
        const newCode = `exports.onExecutePostLogin = async (event, api) => ${generator.default(path.node.body).code || '{}'};`;
        const newAST = parser.parse(newCode);
        path.replaceWith(newAST.program.body[0]);
    },
  });

  return generator.default(ast, {}, code).code;
}

// TODO: Anonymous functions are currently failing
// Enable: "An anonymous rule" test and apply a workaround


// TODO: If there is an inner function with the name "user" or "context" 
// it will generate incorrect code due to declarations in the action.
// Enable: "Avoid name collusion for user" test to fix


module.exports.convert = convert;