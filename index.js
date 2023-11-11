
// Import the express module
const express = require('express');
const cv_fn = require ("./convert");

// Create an instance of the express application
const app = express();

const cors = require('cors');
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Your existing route handling code
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/convert', (req, res) => {
  console.log('POST request received');
  // Your code for processing the request and sending a response
});

// Escapte characters: https://stackoverflow.com/a/5105195
function escapeRegexChars(str) {
    return str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&')
  }

const rule = `
function myRulesFunction(user, context, callback) \{
   const userAppMetadata = user.app_metadata || \{\};
   const namespace = "https://namespace/";

   context.idToken[\`\$\{namespace\}/emp_id\`] = userAppMetadata.emp_id;

   // ... additional code
\}`;

console.log(cv_fn.convert(rule));

// Set the server to listen on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});