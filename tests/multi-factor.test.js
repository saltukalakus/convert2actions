const cv_fn = require ("../convert");

describe("Multi-factor", () => {

    test("convert context.multifactor to api.multifactor.enable simplified", () => {
 
        const rule = `
        function myRulesFunction(user, context, callback) {
            context.multifactor = { 
                provider: "any", 
                allowRememberBrowser: false,
            };

           // ... additional code
       }
        `;
      
        const action = `
        exports.onExecutePostLogin = async (event, api) => {
            api.multifactor.enable("any", { allowRememberBrowser: false });
       
           // ... additional code
       };
        `;
      
        const result = cv_fn.convert(rule).replace(/\s+/g, '')
      
         // assertions
         expect(result).toMatch(action.replace(/\s+/g, ''));
      
       });

    test("convert context.multifactor to api.multifactor.enable with metadata", () => {
 
     const rule = `
     function myRulesFunction(user, context, callback) {
        if (user.app_metadata.needs_mfa === true) {
            context.multifactor = { 
                provider: "any", 
                allowRememberBrowser: false,
            };
        }
    
        // ... additional code
    }
     `;
   
     const action = `
     exports.onExecutePostLogin = async (event, api) => {
        let user = event.user;
        if (user.app_metadata.needs_mfa === true) {
            api.multifactor.enable("any", { allowRememberBrowser: false });
        }
    
        // ... additional code
    };
     `;
   
     const result = cv_fn.convert(rule).replace(/\s+/g, '')
   
      // assertions
      expect(result).toMatch(action.replace(/\s+/g, ''));
   
    });

    test("convert ctx.multifactor to api.multifactor.enable simplified", () => {
 
        const rule = `
        function myRulesFunction(user, ctx, callback) {
            ctx.multifactor = { 
                provider: "any", 
                allowRememberBrowser: false,
            };

           // ... additional code
       }
        `;
      
        const action = `
        exports.onExecutePostLogin = async (event, api) => {
            api.multifactor.enable("any", { allowRememberBrowser: false });
       
           // ... additional code
       };
        `;
      
        const result = cv_fn.convert(rule).replace(/\s+/g, '')
      
         // assertions
         expect(result).toMatch(action.replace(/\s+/g, ''));
      
       });

       test("mfa with none and remember me options", () => {
 
        const rule = `
        function myRulesFunction(user, context, callback) {
            context.multifactor = { 
                provider: "none", 
                allowRememberBrowser: true,
            };

           // ... additional code
       }
        `;
      
        const action = `
        exports.onExecutePostLogin = async (event, api) => {
            api.multifactor.enable("none", { allowRememberBrowser: true });
       
           // ... additional code
       };
        `;
      
        const result = cv_fn.convert(rule).replace(/\s+/g, '')
      
         // assertions
         expect(result).toMatch(action.replace(/\s+/g, ''));
      
       });

       test("mfa with none and any", () => {
 
        const rule = `
        function myRulesFunction(user, context, callback) {
            if (user.name === "test") {
                context.multifactor = { 
                    provider: "none"
                };
    
            } else {
                context.multifactor = { 
                    provider: "any", 
                    allowRememberBrowser: true,
                };
            }

           // ... additional code
       }
        `;
      
        const action = `
        exports.onExecutePostLogin = async (event, api) => {
            let user = event.user;
            if (user.name === "test") {
               api.multifactor.enable("none", {});
            } else {
                api.multifactor.enable("any", { allowRememberBrowser: true });
            }       
           // ... additional code
       };
        `;
      
        const result = cv_fn.convert(rule).replace(/\s+/g, '')
      
         // assertions
         expect(result).toMatch(action.replace(/\s+/g, ''));
      
       });
 })