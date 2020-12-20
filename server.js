const https = require('https');

const fs = require('fs');
const express = require('express');
require('console-stamp')(console, { pattern: 'mm/dd/yyyy HH:MM:ss.l' });
const EVENT_VERBOSE = 'Type of event received is ';
const EVENT_TYPE_SOUND = 'Sound';
const EVENT_TYPE_MOTION = 'Motion';
let secondsElapsed = 0;
const STREAM_PERIOD = 61; // Seconds

const options = {
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('cert.pem')
};

const app = express();

const eventsRouter = require('./api/routes/eventsRoutes');
app.use('/events', eventsRouter);

const assistantRouter = require('./api/routes/assistantRoutes');
app.use('/assistant', assistantRouter);

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use((req, res) => {
  res.writeHead(200);
  res.end("hello world\n");
});

app.listen(5000);

https.createServer(options, app).listen(443);

