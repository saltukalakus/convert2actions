const cv_fn = require ("../convert");

describe("Secrets conversion", () => {


    test("convert configuration to event.secrets", () => {
 
     const rule = `
     function myRulesFunction (user, context, callback) {
        const { CLIENT_ID, CLIENT_SECRET } = configuration;
      
        // ... additional code
      }
     `;
   
     const action = `
     exports.onExecutePostLogin = async (event, api) => {
        const { CLIENT_ID, CLIENT_SECRET } = event.secrets;
      
        // ... additional code
      }
     `;
   
     const result = cv_fn.convert(rule).replace(/\s+/g, '')
   
      // assertions
      expect(result).toMatch(action.replace(/\s+/g, ''));
   
    });

    test("convert configuration to event.secrets", () => {
 
        const rule = `
        function myRulesFunction (user, context, callback) {
           function a () {
            if (configuration.test) {
                console.log(configuration.test);
              }
           }
           // ... additional code
         }
        `;
      
        const action = `
        exports.onExecutePostLogin = async (event, api) => {
           function a () {
            if (event.secrets.test){
                console.log(event.secrets.test);
              }
           }
           // ... additional code
         }
        `;
      
        const result = cv_fn.convert(rule).replace(/\s+/g, '')
      
         // assertions
         expect(result).toMatch(action.replace(/\s+/g, ''));
      
       });
 
 })