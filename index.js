const cv_fn = require ("./convert");

const rule = `
function myRulesFunction(user, context, callback) {
    const userEmail = newName.email;
}
`;

console.log(cv_fn.convert(rule));

