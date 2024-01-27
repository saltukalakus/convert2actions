// Import the express module
const express = require('express');
const bodyParser = require('body-parser');
const cv_fn = require ("./convert");
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
require('dotenv').config();

// Authentication configuration
const config = {
  authRequired: true,
  auth0Logout: true,
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile, offline_access',
    clientID: process.env.CLIENT_ID,
  },
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  baseURL: process.env.APPLICATION_ROOT_URL,
};


// Create an instance of the express application
const app = express();

// Insert Auth
app.use(auth(config));

const cors = require('cors');
app.use(cors());

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Your existing route handling code
app.get('/', requiresAuth(), (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/convert', requiresAuth(), (req, res) => {
  const code = cv_fn.convert(req.body.code);
  res.end(JSON.stringify({ code }));
});

// Set the server to listen on a specific port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});