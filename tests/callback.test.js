const cv_fn = require ("../convert");

describe("Successful function callback handling", () => {

    test("return success", () => {
   
     const rule = `
       function first(user, context, callback) {
        const aRandomVariable = "abc";
        return callback(null, user, context);
       }
     `;
   
     const action = `
       exports.onExecutePostLogin = async (event, api) => {
        const aRandomVariable = "abc";
        return;
      };
     `;
   
     const result = cv_fn.convert(rule).replace(/\s+/g, '')
   
      // assertions
      expect(result).toMatch(action.replace(/\s+/g, ''));
   
    });

    test("return sucess with a different name for callback ", () => {
      const rule = `
        function first(usr, ctx, cb) {
         return cb(null, usr, ctx);
        }
      `;
    
      const action = `
        exports.onExecutePostLogin = async (event, api) => {
            return;
       };
      `;
    
      const result = cv_fn.convert(rule).replace(/\s+/g, '')
    
       // assertions
       expect(result).toMatch(action.replace(/\s+/g, ''));
    
     });
})

describe("Failed function callback handling", () => {
  test("return failure for new Error", () => {
   
    const rule = `
      function first(user, context, callback) {
        const aRandomVariable = "abc";
        const bRandomVariable = "def";
        return callback(new Error("Failure message"));
      }
    `;
  
    const action = `
      exports.onExecutePostLogin = async (event, api) => {
        const aRandomVariable = "abc";
        const bRandomVariable = "def";
        return api.access.deny("Failure message");
     };
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });
  
   test("return failure for new UnauthorizedError", () => {
  
    const rule = `
      function first(user, context, callback) {
        return callback(new UnauthorizedError("Failure message"));
      }
    `;
  
    const action = `
      exports.onExecutePostLogin = async (event, api) => {
        return api.access.deny("Failure message");
     };
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });
  
   test("return failure with a different name for callback", () => {
  
    const rule = `
      function first(user, context, cb) {
        const aTestVariable = "Some variable";
        return cb(new Error("Failure message"));
      }
    `;
  
    const action = `
      exports.onExecutePostLogin = async (event, api) => {
        const aTestVariable = "Some variable";
        return api.access.deny("Failure message");
     };
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });
  
   test("return failure with a custom text", () => {
  
    const rule = `
      function first(user, context, callback) {
        const error = "Some error1";
        return callback("Some error");
      }
    `;
  
    const action = `
      exports.onExecutePostLogin = async (event, api) => {
        const error = "Some error1";
        return api.access.deny("Some error");
     };
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });
  
  
   test("return failure with a custom text as a variable", () => {
  
    const rule = `
      function first(user, context, callback) {
        const error = "Some error";
        return callback(error);
      }
    `;
  
    const action = `
      exports.onExecutePostLogin = async (event, api) => {
        const error = "Some error";
        return api.access.deny(error);
     };
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });
})

