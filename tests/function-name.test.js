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
  
    const action = `The rule should have three parameters. Please correct this and retry!`;
  
    const result = cv_fn.convert(rule).replace(/\s+/g, '')
  
     // assertions
     expect(result).toMatch(action.replace(/\s+/g, ''));
  
   }); 
})


