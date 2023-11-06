const cv_fn = require ("../convert");

describe("Function name conversion", () => {

    test("basic rule", () => {
   
     const rule = `
       function first(user, context, callback) {
       }
     `;
   
     const action = `
       exports.onExecutePostLogin = async (event, api) => {
           let user = event.user;
      };
     `;
   
     const result = cv_fn.convert(rule).replace(/\s+/g, '')
   
      // assertions
      expect(result).toMatch(action.replace(/\s+/g, ''));
   
    });
})