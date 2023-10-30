const parser = require("@babel/parser");
const generator = require("@babel/generator");

const code = `
function add(a, b) {
    return a + b;
}
`;

const ast = parser.parse(code); // Parse JavaScript code into an Abstract Syntax Tree (AST).
const regeneratedCode = generator.default(ast, {}, code); // Regenerate the code while maintaining the original formatting.

console.log(regeneratedCode.code);

