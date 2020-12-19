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

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


/*
app.post('/events/notify', function (request, response, next) {

  console.info(`Event notification received..`);

  const message = request.body.message.data
    ? Buffer.from(request.body.message.data, 'base64').toString()
    : '';


  console.info(`Event message..: ${message}`);

  // const deviceName = message.name;
  const messageJson = JSON.parse(message);
  const deviceName = messageJson.resourceUpdate.name;

  console.log(`Event received from the Device Name..: ${deviceName}`);

  var devicePlainName;
  var assistant_request;
  var isStreaming = false;

  if (deviceName.endsWith('AVPHwEuLP-VHBfwz3WxxJrk3ZBGZI5ibpXNpa43WgvrM-qP_A0f2pZQkdq4NiVSd4JqBCMLUvyqGefbpm4maMZ3_rmrrfg')) {

    devicePlainName = 'Indoor Camera';

    //assistant_request = getAssistantCommand(devicePlainName);

  } else if (deviceName.endsWith('AVPHwEszKytyX3IjME_0CwnBJKjYZJbB0C9J4e3bvA5rwgO7eYWTBw8_BWJCX_rGYkavK4Vd6TSc_eAMcCFdMLyoCA2Pxw')) {

    devicePlainName = 'Garage Camera';

  }

  console.log(`Actual name of device which received event..: ${devicePlainName}`);

  var device_event_type = identifyEventType(messageJson.resourceUpdate.events);

  if (device_event_type != null && device_event_type == 'Motion') {

    if (devicePlainName != null && devicePlainName == 'Garage Camera') {
      assistant_request = getAssistantCommand(devicePlainName);
      commandAssistant(assistant_request);
      isStreaming = true;
      secondsElapsed = 0;
      console.info(`Timer count reset to ${secondsElapsed}`);
      //console.log(`Assistant Command:${assistant_request}`);
    }

  }


  console.info('Event addressed');
  console.info('==================');
  //console.log(request.body)
  response.status(200).json({ received: true });
});

*/


app.use((req, res) => {
  res.writeHead(200);
  res.end("hello world\n");
});

app.listen(5000);

https.createServer(options, app).listen(443);

