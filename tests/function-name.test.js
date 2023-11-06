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

 test("async rule", () => {

    const rule = `
      async function first(user, context, callback) {
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
        let user = event.user;
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
         let user = event.user;
         const userEmail = user.email;
         const userId = user.user_id;
         
         // This property could be undefined in Rules.
         const userAppMetadata = user.app_metadata || {"ss":"bb"};
         
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
        let u = event.user;
        const userEmail = u.email;
     }
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });

   test("user has a different name and has been assigned to a different variable", () => {

    const rule = `
    function myRulesFunction(aa, context, callback) {
        const newName = aa;
        const userEmail = newName.email;
    }
    `;
  
    const action = `
    exports.onExecutePostLogin = async (event, api) => {
        let aa = event.user; 
        const newName = aa;
        const userEmail = newName.email;
     }
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });


   test("user is assigned to a different variable", () => {

    const rule = `
    function myRulesFunction(user, context, callback) {
        const newName = user;
        const userEmail = newName.email;
    }
    `;
  
    const action = `
    exports.onExecutePostLogin = async (event, api) => {
        let user = event.user;
        const newName = user;
        const userEmail = newName.email;
     }
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });

   test("an inside function with an attiribute named user", () => {

    const rule = `
    function first(user, context, callback) {
        // Function body
        function x(user, y, z) {
            console.log(user);
        }
    }
    `;
  
    const action = `
    exports.onExecutePostLogin = async (event, api) => {
        let user = event.user;
        // Function body
        function x(user, y, z) {
            console.log(user);
        }
     }
    `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });

   /*
   test("Avoid name collusion for user", () => {
    const rule = `
      function rule(user, context, callback) {
        function user (a, b) {
            console.log (a, b);
        }
        user("a", "b");
      }
      `;
  
    const action = `
      exports.onExecutePostLogin = async (event, api) => {
        let user = event.user;
        function USER (a, b) {
            console.log (a, b);
        }
        USER("a", "b");
      }
      `;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   });
*/

})


