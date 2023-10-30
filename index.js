const cv_fn = require ("./conversion-rules/function-name");

const code = `
function first(a, b) {
    // Function body
    function two(x, y, z) {
        //console.log
    }
}
`;

console.log(cv_fn.convert(code));

