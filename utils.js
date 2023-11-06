const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");

/*
function isAttributeUsed(code, attributeName) {
  const ast = parser.parse(code);

  let attributeUsed = false;

  traverse(ast, {
    FunctionDeclaration(path) {
      path.traverse({
        Identifier(IdentifierPath) {
          if (
            IdentifierPath.node.name === attributeName &&
            IdentifierPath.key === "name" &&
            IdentifierPath.parentPath.isMemberExpression()
          ) {
            attributeUsed = true;
            path.stop(); // Stop traversal if the attribute is found
          }
        },
      });
    },
  });

  return attributeUsed;
} */

function isAttributeUsed(code, attributeName) {
    const ast = parser.parse(code);
  
    let attributeUsed = false;
  
    traverse(ast, {
      FunctionDeclaration(path) {
          path.traverse({
            Identifier(IdentifierPath) {
              if (IdentifierPath.node.name === attributeName) {
                // Check if the identifier is used within the function's body
                if (IdentifierPath.isReferencedIdentifier()) {
                  attributeUsed = true;
                  path.stop(); // Stop traversal if the first attribute is found
                }
              }
            }
          });
      },
    });
  
    return attributeUsed;
  }


module.exports.isAttributeUsed = isAttributeUsed;