// samples.js

const sampleCodes = [
{
  name: 'Rule 1',
  code: `function rule1(user, context, callback) {
  return callback(null, user, context);
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
];