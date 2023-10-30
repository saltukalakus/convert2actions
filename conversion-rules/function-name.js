const parser = require("@babel/parser");
const generator = require("@babel/generator");
const t = require("@babel/types"); // Import the Babel types library
const traverse = require("@babel/traverse").default;

function convert(code) {

    const ast = parser.parse(code);

    // Traverse the AST and modify the function name
    traverse(ast, {
      FunctionDeclaration(path) {
        if (path.node.id.name === "add") {
          path.node.id.name = "multiply"; // Change the function name
        }
      },
    });
    
    const regeneratedCode = generator.default(ast, {}, code);
    return regeneratedCode.code;
}

module.exports.convert = convert;