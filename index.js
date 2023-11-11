// Import the express module
const express = require('express');
const bodyParser = require('body-parser');
const cv_fn = require ("./convert");

// Create an instance of the express application
const app = express();

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
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/convert', (req, res) => {
  const code = cv_fn.convert(req.body.code);
  res.end(JSON.stringify({ code }));
});

// Set the server to listen on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});