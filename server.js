const https = require('https');
const http = require('http')
const fs = require('fs');
const express = require('express');
require('console-stamp')(console, { pattern: 'mm/dd/yyyy HH:MM:ss.l' });
const EVENT_VERBOSE = 'Type of event received is ';
const EVENT_TYPE_SOUND = 'Sound';
const EVENT_TYPE_MOTION = 'Motion';

const options = {
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('cert.pem')
};

const app = express();

//const eventsRouter = require('./api/routes/eventsRoutes');
//app.use('/events', eventsRouter);

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

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

    if (devicePlainName != null) {
      assistant_request = getAssistantCommand(devicePlainName);
      commandAssistant(assistant_request);
      isStreaming = true;

      //console.log(`Assistant Command:${assistant_request}`);
    }

  }


  setTimeout(stopCameraStream, 60000, isStreaming);

  console.info('Event addressed');
  console.info('==================');
  //console.log(request.body)
  response.status(200).json({ received: true });
});


function stopCameraStream(isStreaming) {

  
  if (isStreaming) {
    var assistant_command = getAssistantCommand('Camera');
    commandAssistant(assistant_command);
    isStreaming = false;
    console.info('Streaming stoppped via Timer');
  }


}

function commandAssistant(assistant_request) {

  //console.log(`assistant_request..: ${assistant_request}`)
  console.info(`Assistant Command Executing..:${assistant_request}`);
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/assistant',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': assistant_request.length
    }
  }

  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      process.stdout.write(d)
    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.write(assistant_request)
  req.end()

}

function identifyEventType(events) {


  var device_event_type = events["sdm.devices.events.CameraSound.Sound"];

  if (device_event_type == null) {
    device_event_type = events["ssdm.devices.events.CameraMotion.Motion"];

    if (device_event_type == null) {

    } else {
      console.info(`${EVENT_VERBOSE} ${EVENT_TYPE_MOTION} `);
      device_event_type = EVENT_TYPE_MOTION;
    }

  } else {
    console.info(`${EVENT_VERBOSE} ${EVENT_TYPE_SOUND} `);
    device_event_type = EVENT_TYPE_SOUND;
  }
  return device_event_type;
}

function getAssistantCommand(device_name) {

  var command_request = `{
    "command": "show ${device_name} on Hub",
    "converse": false,
    "user": "techsudhagar@gmail.com" 
}`;

  return command_request;

}

app.use((req, res) => {
  res.writeHead(200);
  res.end("hello world\n");
});

app.listen(5000);

https.createServer(options, app).listen(443);

