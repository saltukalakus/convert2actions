const cv_fn = require ("../convert");

describe("Function callback handling", () => {

    test("return success", () => {
   
     const rule = `
       function first(user, context, callback) {
        return callback(null, user, context);
       }
     `;
   
     const action = `
       exports.onExecutePostLogin = async (event, api) => {
           let user = event.user;
           return;
      };
     `;
   
     const result = cv_fn.convert(rule).replace(/\s+/g, '')
   
      // assertions
      expect(result).toMatch(action.replace(/\s+/g, ''));
   
    });

    test("return sucess with a different name for callback ", () => {
      const rule = `
        function first(user, context, cb) {
         return cb(null, user, context);
        }
      `;
    
      const action = `
        exports.onExecutePostLogin = async (event, api) => {
            let user = event.user;
            return;
       };
      `;
    
      const result = cv_fn.convert(rule).replace(/\s+/g, '')
    
       // assertions
       expect(result).toMatch(action.replace(/\s+/g, ''));
    
     });

     test("return sucess while callback is assigned to a different name", () => {
      const rule = `
        function first(user, context, cb) {
         let newcb = cb;
         return newcb(null, user, context);
        }
      `;
    
      const action = `
        exports.onExecutePostLogin = async (event, api) => {
            let user = event.user;
            return;
       };
      `;
    
      const result = cv_fn.convert(rule).replace(/\s+/g, '')
    
       // assertions
       expect(result).toMatch(action.replace(/\s+/g, ''));
    
     });
})