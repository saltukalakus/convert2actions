// samples.js

const sampleCodes = [
{
  name: 'Rule 1',
  code: `function rule1(user, context, callback) {
  callback(null, user, context);
}
`,
},
{
  name: 'Rule 2',
  code: `function rule2(user, context, callback) {
  const { CLIENT_ID } = configuration;

  if (CLIENT_ID === "abc") {
    return callback(null, user, context);
  }
  return callback(new Error("Unsupported client!"));
}
`,
},
{
  name: 'Rule 3',
  code: `function rule3(user, context, callback) {
  const namespace = "https://namespace/acme";
  context.idToken[namespace] = "hello";
 
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
 }
`,
},
{
  name: 'Client Credentials Exchange (M2M) Hook',
  code: `module.exports = function(client, scope, audience, context, cb) {
    var access_token = {};
    access_token.scope = scope;
  
    cb(null, access_token);
  };
`,
},
{
  name: 'Pre User Registration Hook',
  code: `module.exports = function (user, context, cb) {
    var response = {};
    response.user = user;
    cb(null, response);
  };
`,
},
{
  name: 'Post User Registration Hook',
  code: `module.exports = function (user, context, cb) {
    // Perform any asynchronous actions, e.g. send notification to Slack.
    console.log(context);
    cb();
  };
`,
},
{
  name: 'Post Change Password Hook',
  code: `module.exports = function (user, context, cb) {
    // Perform any asynchronous actions, e.g. send notification to Slack.
    cb();
  };
`,
},
{
  name: 'Send Phone Message Hook',
  code: `module.exports = function(recipient, text, context, cb) {
    // Configure custom phone message
  
    cb(null, {});
  };
`,
},
];


