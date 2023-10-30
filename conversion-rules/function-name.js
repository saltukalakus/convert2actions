const parser = require("@babel/parser");
const generator = require("@babel/generator");
const traverse = require("@babel/traverse").default;

function convert(code) {
    const ast = parser.parse(code);

    traverse(ast, {
      FunctionDeclaration(path) {

        // Check if the function has a parent node
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

module.exports.convert = convert;