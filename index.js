// Import the express module
const express = require('express');
const bodyParser = require('body-parser');
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
require('dotenv').config();
const axios = require('axios');
const winston = require('winston');

// Define the logger configuration
const logger = winston.createLogger({
  level: 'info', // Set the default logging level
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to logs
    winston.format.json() // Log in JSON format
  ),
  transports: [
    new winston.transports.File({
      filename: 'logfile.log', // Name of the log file
      level: 'info', // Log level for this transport
      maxsize: 5242880, // Max size of the log file in bytes (5MB in this example)
      maxFiles: 5, // Max number of log files to keep (5 in this example)
      tailable: true, // Allow new logs to be appended when the file is rotated
      handleExceptions: true, // Handle exceptions automatically
    })
  ]
});

// Optionally, log uncaught exceptions
logger.exceptions.handle(
  new winston.transports.File({ filename: 'exceptions.log' })
);

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

app.post('/convert-rule', requiresAuth(), (req, res) => {
  const code = req.body.code;
  const userMessage = `Convert this Auth0 Rule to Auth0 Action which should start with exports.onExecutePostLogin and reply back the converted code in a javascript block "${code}"`;

  logger.log('info', 'RULE Conversion - User: ' +  req.oidc.user.sub + ' Code:' + code);

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

app.post('/convert-hook-phone-message', requiresAuth(), (req, res) => {
  const code = req.body.code;
  const userMessage = `Convert this Auth0 Send Phone Message Hook to Auth0 Send Phone Message Action which should start with exports.onExecuteSendPhoneMessage and reply back the converted code in a javascript block "${code}"`;

  logger.log('info', 'Hook Conversion - User: ' +  req.oidc.user.sub + ' Code:' + code);

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

app.post('/convert-hook-client-credentials', requiresAuth(), (req, res) => {
  const code = req.body.code;
  const userMessage = `Convert this Auth0 Client Credentials Exchange Hook to Auth0 Machine to Machine Action which should start with exports.onExecuteCredentialsExchange and reply back the converted code in a javascript block "${code}"`;

  logger.log('info', 'Hook Conversion - User: ' +  req.oidc.user.sub + ' Code:' + code);

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

app.post('/convert-hook-pre-user-registration', requiresAuth(), (req, res) => {
  const code = req.body.code;
  const userMessage = `Convert this Auth0 Pre User Registration Hook to Auth0 Pre User Registration Action which should start with exports.onExecutePreUserRegistration and reply back the converted code in a javascript block "${code}"`;

  logger.log('info', 'Hook Conversion - User: ' +  req.oidc.user.sub + ' Code:' + code);

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

app.post('/convert-hook-post-user-registration', requiresAuth(), (req, res) => {
  const code = req.body.code;
  const userMessage = `Convert this Auth0 Post User Registration Hook to Auth0 Post User Registration Action which should start with exports.onExecutePostUserRegistration and reply back the converted code in a javascript block "${code}"`;

  logger.log('info', 'Hook Conversion - User: ' +  req.oidc.user.sub + ' Code:' + code);

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

app.post('/convert-hook-post-change-password', requiresAuth(), (req, res) => {
  const code = req.body.code;
  const userMessage = `Convert this Auth0 Post Change Password Hook to Auth0 Post Change Password Action which should start with exports.onExecutePostChangePassword and reply back the converted code in a javascript block "${code}"`;

  logger.log('info', 'Hook Conversion - User: ' +  req.oidc.user.sub + ' Code:' + code);

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