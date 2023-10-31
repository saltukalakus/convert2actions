const cv_fn = require ("../conversion-rules/function-name");


describe("Function name conversion", () => {

 test("Basic rule", () => {

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

 test("Async rule", () => {

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

 test("A rule with a nested function", () => {

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

   test("An anonymous rule", () => {

    const rule = `
      function a(user, context, callback) {

        var a = function (fadsd, asd) {
            var dasd = 4;
        }();
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

})