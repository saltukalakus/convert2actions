const cv_fn = require ("../convert");

describe("Metadata conversion", () => {

    test("convert app_metadata to api.user.setAppMetadata", () => {
 
        const rule = `
        function myRulesFunction(user, context, callback) {
           auth0.users
               .updateAppMetadata(user.user_id, user.app_metadata) 
               .then(() => { console.log("Hello"); callback(null, user, context);})
               .catch((err) => callback(err));
       }
        `;
      
        const action = `
        exports.onExecutePostLogin = async (event, api) => {
          (()=>{console.log("Hello");
          return;
          })();
       };
        `;
      
        const result = cv_fn.convert(rule).replace(/\s+/g, '')
      
         // assertions
         expect(result).toMatch(action.replace(/\s+/g, ''));
      
       }); 

    test("convert app_metadata to api.user.setAppMetadata", () => {
 
     const rule = `
     function myRulesFunction(user, context, callback) {
        user.app_metadata = user.app_metadata || {}; 
        user.app_metadata.roles = user.app_metadata.roles || [];
        user.app_metadata.roles.push("administrator"); 
    
        auth0.users
            .updateAppMetadata(user.user_id, user.app_metadata) 
            .then(() => callback(null, user, context))
            .catch((err) => callback(err));
    }
     `;
   
     const action = `
     exports.onExecutePostLogin = async (event, api) => {
        let user = event.user;
        user.app_metadata = user.app_metadata || {}; 
        user.app_metadata.roles = user.app_metadata.roles || [];
        user.app_metadata.roles.push("administrator"); 
        (()=> return)();
        api.user.setAppMetadata("roles", user.app_metadata.roles);
    };
     `;
   
     const result = cv_fn.convert(rule).replace(/\s+/g, '')
   
      // assertions
      expect(result).toMatch(action.replace(/\s+/g, ''));
   
    }); 
 })