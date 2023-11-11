const cv_fn = require ("../convert");


describe("Custom claims conversion", () => {

    test("convert basic idToken", () => {
 
        const rule = `
        function myRulesFunction(user, context, callback) {
           context.idToken["a"] = "b";
        }`;
      
        const action = `
        exports.onExecutePostLogin = async (event, api) => { 
           api.idToken.setCustomClaim( "a", "b");		   
        };
        `;
      
        const result = cv_fn.convert(rule).replace(/\s+/g, '')
      
         // assertions
         expect(result).toMatch(action.replace(/\s+/g, ''));
      
       });

    test("convert basic accessToken", () => {
 
        const rule = `
        function myRulesFunction(user, context, callback) {
           context.accessToken["a"] = "b";
        }`;
      
        const action = `
        exports.onExecutePostLogin = async (event, api) => { 
           api.accessToken.setCustomClaim( "a", "b");		   
        };
        `;
      
        const result = cv_fn.convert(rule).replace(/\s+/g, '')
      
         // assertions
         expect(result).toMatch(action.replace(/\s+/g, ''));
      
       });

    test("convert idToken & accessToken with a different name for context ", () => {
 
        const rule = `
        function myRulesFunction(user, ctx, callback) {
           ctx.idToken["a"] = "b";
           ctx.accessToken["c"] = "d";
        }`;
      
        const action = `
        exports.onExecutePostLogin = async (event, api) => { 
           api.idToken.setCustomClaim( "a", "b");	
           api.accessToken.setCustomClaim( "c", "d");		   
        };
        `;
      
        const result = cv_fn.convert(rule).replace(/\s+/g, '')
      
         // assertions
         expect(result).toMatch(action.replace(/\s+/g, ''));
      
       });


    test("convert context.idToken to api.idToken.setCustomClaim with namespace", () => {
 
        const rule = `
        function myRulesFunction(user, context, callback) {
           const namespace = "https://namespace/test1";
           context.idToken[namespace] = "test";
        
           // ... additional code
        }`;
      
        const action = `
        exports.onExecutePostLogin = async (event, api) => {
           const namespace = "https://namespace/test1";
       
           api.idToken.setCustomClaim(
               namespace, 
               "test"
           ); 		   
       
           // ... additional code
       };
        `;
      
        const result = cv_fn.convert(rule).replace(/\s+/g, '')
      
         // assertions
         expect(result).toMatch(action.replace(/\s+/g, ''));
      
       });



    test("convert context.idToken to api.idToken.setCustomClaim with namespaced attribute and metadata", () => {
 
     const rule = `
     function myRulesFunction(user, context, callback) {
        const userAppMetadata = user.app_metadata || {};
        const namespace = "https://namespace/";
    
        context.idToken[\`$\{namespace\}/emp_id\`] = userAppMetadata.emp_id;
    
        // ... additional code
    }`;
   
     const action = `
     exports.onExecutePostLogin = async (event, api) => {
        let user = event.user;
        const userAppMetadata = user.app_metadata || {};
        const namespace = "https://namespace/";
    
        api.idToken.setCustomClaim(
            \`$\{namespace\}/emp_id\`, 
            userAppMetadata.emp_id
        ); 		   
    
        // ... additional code
    };
     `;
   
     const result = cv_fn.convert(rule).replace(/\s+/g, '')
   
      // assertions
      expect(result).toMatch(action.replace(/\s+/g, ''));
   
    });


    test("convert context.accessToken to api.accessToken.setCustomClaim with namespaced attribute and metadata", () => {
 
        const rule = `
        function myRulesFunction(user, context, callback) {
           const userAppMetadata = user.app_metadata || {};
           const namespace = "https://namespace/";

           context.accessToken[\`\${namespace}/emp_id\`] = userAppMetadata.emp_id;
       
           // ... additional code
       }`;
      
        const action = `
        exports.onExecutePostLogin = async (event, api) => {
           let user = event.user;
           const userAppMetadata = user.app_metadata || {};
           const namespace = "https://namespace/";

           api.accessToken.setCustomClaim(
               \`\${namespace}/emp_id\`, 
               userAppMetadata.emp_id
           );
       
           // ... additional code
       };
        `;
      
        const result = cv_fn.convert(rule).replace(/\s+/g, '')
      
         // assertions
         expect(result).toMatch(action.replace(/\s+/g, ''));
      
       });
 })