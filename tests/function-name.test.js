const cv_fn = require ("../conversion-rules/function-name");


describe("Function name conversion", () => {

 test("basic rule", () => {

  const rule = `
    function first(user, context, callback) {
    }
  `;

  const action = `
    exports.onExecutePostLogin = async (event, api) => {
   };
  `;

  const result = cv_fn.convert(rule).replace(/\s+/g, '')

   // assertions
   expect(result).toMatch(action.replace(/\s+/g, ''));

 });

 test("async rule", () => {

    const rule = `
      async function first(user, context, callback) {
      }
    `;
  
    const action = `
      exports.onExecutePostLogin = async (event, api) => {
     };
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });

 test("a rule with a nested function", () => {

    const rule = `
    function first(user, context, callback) {
        // Function body
        function two(x, y, z) {
            //console.log
        }
    }
    `;
  
    const action = `
      exports.onExecutePostLogin = async (event, api) => {
        // Function body
        function two(x, y, z) {
            //console.log
        }
    }
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });

   /*
  test("An anonymous rule", () => {
    const rule = `
      function (user, context, callback) {
      }
      `;
  
    const action = `
      exports.onExecutePostLogin = async (event, api) => {
      }
      `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });
   */ 

   test("an action signature", () => {
    const rule = `
      exports.onExecutePostLogin = async (event, api) => {
      }
      `;
  
    const action = `
      exports.onExecutePostLogin = async (event, api) => {
      }
      `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   }); 

   test("convert user to event", () => {

    const rule = `
    function myRulesFunction(user, context, callback) {
        const userEmail = user.email;
        const userId = user.user_id;
        
        // This property could be undefined in Rules.
        const userAppMetadata = user.app_metadata || {"ss":"bb"};
        
        // ... additional code
    }
    `;
  
    const action = `
    exports.onExecutePostLogin = async (event, api) => {
          const userEmail = event.user.email;
          const userId = event.user.user_id;
        
          // This property could be undefined in Rules.
          const userAppMetadata = event.user.app_metadata || {"ss":"bb"};
        
          // ... additional code
     }
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });

   test("user has a different name", () => {

    const rule = `
    function myRulesFunction(u, context, callback) {
        const userEmail = u.email;
    }
    `;
  
    const action = `
    exports.onExecutePostLogin = async (event, api) => {
        const userEmail = event.user.email;
     }
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });

   test("user has a different name and has been assigned to a different name", () => {

    const rule = `
    function myRulesFunction(aa, context, callback) {
        const newName = aa;
        const userEmail = newName.email;
    }
    `;
  
    const action = `
    exports.onExecutePostLogin = async (event, api) => {
        const newName = event;
        const userEmail = newName.email;
     }
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });


   test("user is assigned to a different name", () => {

    const rule = `
    function myRulesFunction(user, context, callback) {
        const newName = user;
        const userEmail = newName.email;
    }
    `;
  
    const action = `
    exports.onExecutePostLogin = async (event, api) => {
        const newName = event;
        const userEmail = newName.email;
     }
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });

   test("inside function with the name user", () => {

    const rule = `
    function first(a, b) {
        // Function body
        function user(x, y, z) {
            //console.log
        }
    }
    `;
  
    const action = `
    exports.onExecutePostLogin = async (event, api) => {
        // Function body
        function user(x, y, z) {
            //console.log
        }
     }
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });

})


