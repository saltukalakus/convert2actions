const cv_fn = require ("./conversion-rules/function-name");

const rule = `
function myRulesFunction(user, context, callback) {
    const newName = user;
    const userEmail = newName.email;
}
`;

console.log(cv_fn.convert(rule));

