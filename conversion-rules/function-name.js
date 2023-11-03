const parser = require("@babel/parser");
const generator = require("@babel/generator");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");

function convert(code) {

    const ast = parser.parse(code);

    traverse(ast, {
        FunctionDeclaration(path) {
            // Traverse the function's body and modify variable assignments
            path.traverse({
              VariableDeclaration(varPath) {
                varPath.traverse({
                  VariableDeclarator(declaratorPath) {
                    if (declaratorPath.node.init) {
                      declaratorPath.traverse({
                        Identifier(IdentifierPath) {
                          if ((IdentifierPath.node.name === path.node.params[0].name) && IdentifierPath.node.name !== "user"){
                            // Update references to the first parameter to "event"
                            IdentifierPath.node.name = "event";
                          }
                        },
                        MemberExpression(MemberExpressionPath) {
                          if (
                            t.isIdentifier(MemberExpressionPath.node.object) &&
                            MemberExpressionPath.node.object.name === path.node.params[0].name
                          ) {
                            // Update variable assignments referencing the first parameter
                            MemberExpressionPath.node.object = t.memberExpression(t.identifier("event"), t.identifier("user"));
                          }
                        },
                      });
                    }
                  },
                });
              },
            });
        },
      });

    const code2 = generator.default(ast, {}, code).code
    const ast2 = parser.parse(code2);

    traverse(ast2, {
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

  return generator.default(ast2, {}, code2).code;
}

// TODO: 
function searchReplaceAnonymous(code) {

  return code;
}


module.exports.convert = convert;