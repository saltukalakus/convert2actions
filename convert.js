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
  let warnings = "";

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

  /* Get the then block and execute for metadata update
     E.g. 
     function myRulesFunction(user, context, callback) {
        auth0.users
        .updateAppMetadata(user.user_id, user.app_metadata)
        .then(() => {
          console.log('hello');
          callback(null, user, context);
        })
        .catch((err) => callback(err));
        // ... additional code
      }
    is converted to;
      function myRulesFunction(user, context, callback) {
        auth0.users
        .updateAppMetadata(user.user_id, user.app_metadata)
        .then(() => {
          console.log('hello');
          callback(null, user, context);
        })
      }
*/

// remove catch in metadata update
traverse(ast, {
  CallExpression(path) {
      const { callee } = path.node;
      if (t.isIdentifier(callee.property, { name: 'catch' }) && 
          callee.type === 'MemberExpression' && 
          callee.property.type === 'Identifier') {
          // Check if the callee is a function call and remove it
          if (t.isCallExpression(callee.object)) {
              path.replaceWith(callee.object);
              path.stop(); 
          }
      }
  },
});

  /* Get the then block and execute for metadata update
     E.g. 
     function myRulesFunction(user, context, callback) {
        auth0.users
        .updateAppMetadata(user.user_id, user.app_metadata)
        .then(() => {
          console.log('hello');
          callback(null, user, context);
        })
        .catch((err) => callback(err));
        // ... additional code
      }
    is converted to;
      function myRulesFunction(user, context, callback) {
          (()=>{console.log("Hello");
          return;
          })();
      }
*/

// Extract the function in the then block
traverse(ast, {
  CallExpression(path) {
    const { callee } = path.node;
    if (
      t.isIdentifier(callee.property, { name: 'then' })
    ){
      const arrowFunction = path.node.arguments[0].body;
      const arrowFunctionExpression = t.arrowFunctionExpression([], arrowFunction);
      const arrowFunctionStatement = t.expressionStatement(t.callExpression(arrowFunctionExpression, []));
      path.replaceWith(arrowFunctionStatement);
    }
  },
});

// Find the updated app_metadata and add api.user.setAppMetadata function call
let attributeName;
let identifierName = [];

traverse(ast, {
    MemberExpression(path) {
        if (t.isIdentifier(path.node.property) && 
            t.isIdentifier(path.parent.property) &&
            path.node.property.name === "app_metadata") {
            identifierName = [];
            attributeName = path.parent.property.name;
            identifierName.unshift(attributeName);
            identifierName.unshift("app_metadata");
            if (path.node.object.name) 
            identifierName.unshift(path.node.object.name);
        }  else if (identifierName.length > 0) {
            identifierName.unshift(path.node.property.name);
            if (path.node.object.name) 
            identifierName.unshift(path.node.object.name);
        }
    },
});

const identifierString = identifierName.join('.');

traverse(ast, {
  FunctionDeclaration(path) {
    if (!path.parentPath.isProgram()) {
      // Skip this function if it's not in the top-level of the program
      return;
    }   
    if (attributeName) {
      const setAppMetadataCall = t.expressionStatement(
          t.callExpression(
              t.memberExpression(t.identifier('api.user'), t.identifier('setAppMetadata')),
              [
                  t.stringLiteral(attributeName),
                  t.identifier(identifierString),
              ]
          )
      );
  
      path.get('body').push(setAppMetadataCall);
    }
  },
});


  // Convert multi-factor
  traverse(ast, {
    AssignmentExpression(path) {
        if (isContextMultifactorAssignment(path, secondParamName)) {
            const value = getValueFromAssignment(path);

            if (t.isObjectExpression(value)) {
                const options = getObjectPropertiesExcludedOne(value, "provider");
                const mfaType = getPropertyValue(value, "provider");
                
                if (mfaType) {
                   // Replace with api.multifactor.enable
                  path.replaceWith(
                    t.expressionStatement(
                      t.callExpression(
                        t.memberExpression(t.identifier("api"), t.identifier("multifactor.enable")),
                          [t.stringLiteral(mfaType), t.objectExpression(options)]
                      )
                    )
                  );
                } else {
                  path.replaceWith(
                    t.expressionStatement(
                      t.callExpression(
                        t.memberExpression(t.identifier("api"), t.identifier("multifactor.enable")),
                          [t.stringLiteral("UNDEFINED"), t.objectExpression(options)]
                      )
                    )
                  );
                  warnings += `Provider attribute is obligatory for context.multifactor object. Please correct the rule by adding 
                               the provider attribute. 
                               E.g.
                               context.multifactor = { 
                                provider: "none"
                               };`;
                }

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
        if ((path.node.arguments.length >= 1) &&
         !t.isNullLiteral(path.node.arguments[0])){
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
        } else {
            path.replaceWith(t.identifier("return"));
        }
      }
    }
  });

  // Convert "user" attribute of a rule if user is used
  if (utils.isAttributeUsed(ast, firstParamName)) {
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
      if (path.node.id) {
          // Replace the entire function declaration with an assignment to exports
          path.replaceWith(
              t.assignmentExpression(
                  '=',
                  t.memberExpression(t.identifier('exports'), t.identifier('onExecutePostLogin')),
                  t.arrowFunctionExpression(
                      [t.identifier('event'), t.identifier('api')],
                      t.blockStatement(path.node.body.body),
                      true // Add async to the arrow function
                  )
              )
          );
          path.stop(); // Stop traversing
      }
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


// TODO: Limitation         
//    auth0.users
//            .updateAppMetadata(user.user_id, user.app_metadata) 
//            .then(() => callback(null, user, context))
//            .catch((err) => callback(err));
//
//  then block converts callback(null, user, context)) to return leading invalid JS code
//            (()=> return)();
//            correct converstion:
//            (()=> {return;})();
module.exports.convert = convert;