const cv_fn = require ("./conversion-rules/function-name");


const code = `
function add(a, b) {
    // Function body
}
`;

console.log(cv_fn.convert(code));

