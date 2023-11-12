const parser = require("@babel/parser");
const generator = require("@babel/generator");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const utils = require ("./utils");

function isContextMultifactorAssignment(path, secondParam) {
  return (
      t.isMemberExpression(path.node.left) &&
      t.isIdentifier(path.node.left.object, { name: secondParam}) &&
      t.isIdentifier(path.node.left.property, { name: "multifactor" })
  );
}

function getPropertyValue(objectExpression, propertyName) {
  const property = objectExpression.properties.find(
      (prop) => t.isObjectProperty(prop) && t.isIdentifier(prop.key, { name: propertyName })
  );

  return property ? property.value.value : null;
}

function getObjectProperties(objectExpression) {
  return objectExpression.properties
      .filter((prop) => t.isObjectProperty(prop))
      .map((prop) => t.objectProperty(prop.key, prop.value));
}

function getObjectPropertiesExcludedOne(objectExpression, exclude) {
  return objectExpression.properties
      .filter((prop) => (t.isObjectProperty(prop) && prop.key.name !== exclude))
      .map((prop) => t.objectProperty(prop.key, prop.value));
}

function getKeyFromAssignment(path) {
  if (path.node.left.property.value) return t.stringLiteral(path.node.left.property.value) ;
  if (path.node.left.property.name) return t.identifier(path.node.left.property.name);
  return path.node.left.property;
}

function getValueFromAssignment(path) {
  return path.node.right;
}

function convert(code) {
  try {
    parser.parse(code);
  }
  catch (e) {
      const log = `An exception occurred while inspecting the rule.
  Please check if the rule has the proper syntax. 
  Error: ${e.reasonCode} 
  Place: ${JSON.stringify(e.loc)}`;
      console.log(log);
      return (log);
  }
  
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

  // Convert multi-factor
  traverse(ast, {
    AssignmentExpression(path) {
        if (isContextMultifactorAssignment(path, secondParamName)) {
            const value = getValueFromAssignment(path);

            if (t.isObjectExpression(value)) {
                const options = getObjectPropertiesExcludedOne(value, "provider");

                // Replace with api.multifactor.enable
                path.replaceWith(
                    t.expressionStatement(
                        t.callExpression(
                            t.memberExpression(t.identifier("api"), t.identifier("multifactor.enable")),
                            [t.stringLiteral("any"), t.objectExpression(options)]
                        )
                    )
                );
            }
        }
    },
  });


  // Convert custom claims
  traverse(ast, {
    AssignmentExpression(path) {
        const key = getKeyFromAssignment(path);
        const value = getValueFromAssignment(path);
        if (path.node.left.object.object && 
        path.node.left.object.object.name === secondParamName &&
        path.node.left.object.property.name === "idToken") {
          path.replaceWith(
            t.expressionStatement(
                t.callExpression(
                    t.memberExpression(t.identifier("api.idToken"), t.identifier("setCustomClaim")),
                    [key, value]
                )
            )
          );
       } else if ( path.node.left.object.object &&
       path.node.left.object.object.name === secondParamName &&
       path.node.left.object.property.name === "accessToken") {
        path.replaceWith(
          t.expressionStatement(
              t.callExpression(
                  t.memberExpression(t.identifier("api.accessToken"), t.identifier("setCustomClaim")),
                  [key, value]
              )
          )
        );
       }
    },
 });

  // Convert success callbacks
  traverse(ast, {
    ReturnStatement(path) {
      if (path.node.argument) {
        if (t.isCallExpression(path.node.argument) && t.isIdentifier(path.node.argument.callee) && path.node.argument.callee.name === thirdParamName) {
          // Check if the call expression has the arguments (null, user, context)
          if (
            path.node.argument.arguments.length === 3 &&
            t.isNullLiteral(path.node.argument.arguments[0]) &&
            t.isIdentifier(path.node.argument.arguments[1]) &&
            t.isIdentifier(path.node.argument.arguments[2])
          ) {
            // Replace the ReturnStatement with an empty ReturnStatement
            path.replaceWith(t.returnStatement());
          }
        }
      }
    },
  });

  // Handle failure callback functions
  traverse(ast, {
    CallExpression(path) {
      if (t.isCallExpression(path.node) && t.isIdentifier(path.node.callee, { name: thirdParamName })) {
        if (path.node.arguments.length >= 1) {
          const errorMessage = path.node.arguments[0];
          let denyCall;
  
          if (t.isNewExpression(errorMessage) && 
               (t.isIdentifier(errorMessage.callee, { name: "Error" }) ||
                t.isIdentifier(errorMessage.callee, { name: "UnauthorizedError" })
               )
             ) {
            // Handle Error object with a message
            const messageArg = errorMessage.arguments[0];
            denyCall = t.callExpression(t.memberExpression(t.memberExpression(t.identifier("api"), t.identifier("access")), t.identifier("deny")), [messageArg]);
          } else {
            // Handle a simple message
            denyCall = t.callExpression(t.memberExpression(t.memberExpression(t.identifier("api"), t.identifier("access")), t.identifier("deny")), [errorMessage]);
          }
  
          path.replaceWith(denyCall);
        }
      }
    }
  });

  // Convert "user" attribute of a rule if user is used
  if (utils.isAttributeUsed(generator.default(ast, {}, code).code, firstParamName)) {
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
  }

  // Convert secrets
  traverse(ast, {
    Identifier(path) {
      if (path.node.name === "configuration") {
        // Update the identifier "configuration" to "event.secrets"
        path.node.name = "event.secrets";
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

// TODO: If a callback is assinged to a variable and then consumed the script
// isn't able to convert it. Enable "return failure while callback is assigned to a different name" and
// "return sucess while callback is assigned to a different name" tests

module.exports.convert = convert;