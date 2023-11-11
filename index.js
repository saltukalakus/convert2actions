const cv_fn = require ("./convert");

const rule = `
function myRulesFunction(user, context, callback) {
   const userAppMetadata = user.app_metadata || {};
   const namespace = "https://namespace/";

   context.idToken[\`$\{namespace\}/emp_id\`] = userAppMetadata.emp_id;

   // ... additional code
}`;

console.log(cv_fn.convert(rule));

