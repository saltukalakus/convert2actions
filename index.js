// Import the express module
const express = require('express');
const bodyParser = require('body-parser');
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.CHATGPT_TOKEN;  
const endpoint = process.env.CHATGPT_ENDPOINT;  


async function callChatGPT(message) {
  try {
    const response = await axios.post(
      endpoint,
      {
        model: 'gpt-4-0125-preview',  // Specify the desired model
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    // Extract and return the assistant's reply
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling ChatGPT API:', error.message);
    throw error;
  }
}

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
  const code = req.body.code;
  const userMessage = `Please convert this code to an Auth0 action and only reply back the corrected code in a javascript block "${code}"`;
  //res.end(JSON.stringify({ code }));
  callChatGPT(userMessage)
  .then(assistantReply => {
    const codeRegex = /```javascript(.*?)```/s;
    const match = assistantReply.match(codeRegex);
    if (match) {
      const extractedCode = match[1];
      res.end(JSON.stringify({extractedCode}));
    } else {
      console.log("No code block found in the reply.");
      res.end(JSON.stringify({"error":"No code block found in the reply."}));
    }
  })
  .catch(error => {
    // Handle errors
    res.end(JSON.stringify({ error }));
  });
});

// Set the server to listen on a specific port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});