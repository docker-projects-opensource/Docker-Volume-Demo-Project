const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Data directory for persistence
const DATA_DIR = '/app/data';
const DATA_FILE = path.join(DATA_DIR, 'messages.txt');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory counter (will reset when container restarts)
let requestCount = 0;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple home page
app.get('/', (req, res) => {
  requestCount++;
  res.send(`
    <h1>Docker Volume Demo</h1>
    <p>Request count since last container start: ${requestCount}</p>
    <h2>Save a message</h2>
    <form action="/save" method="POST">
      <input type="text" name="message" placeholder="Enter a message">
      <button type="submit">Save</button>
    </form>
    <h2>Stored Messages</h2>
    <p><a href="/messages">View Messages</a></p>
  `);
});

// Save a message to the persistent storage
app.post('/save', (req, res) => {
  const message = req.body.message || 'Empty message';
  const timestamp = new Date().toISOString();
  
  try {
    fs.appendFileSync(DATA_FILE, `${timestamp}: ${message}\n`);
    res.redirect('/');
  } catch (error) {
    res.status(500).send(`Error saving message: ${error.message}`);
  }
});

// View all messages from persistent storage
app.get('/messages', (req, res) => {
  try {
    let messages = 'No messages yet.';
    
    if (fs.existsSync(DATA_FILE)) {
      messages = fs.readFileSync(DATA_FILE, 'utf8');
    }
    
    res.send(`
      <h1>Stored Messages</h1>
      <pre>${messages}</pre>
      <a href="/">Back</a>
    `);
  } catch (error) {
    res.status(500).send(`Error reading messages: ${error.message}`);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
  console.log(`Data being stored in: ${DATA_DIR}`);
});