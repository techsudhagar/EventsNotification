const https = require('https');
const http = require('http')
const fs = require('fs');
const express = require('express');


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

  const message = request.body.message.data
    ? Buffer.from(request.body.message.data, 'base64').toString()
    : '';

  // const deviceName = message.name;
  const messageJson = JSON.parse(message);
  const deviceName = messageJson.resourceUpdate.name;

  var devicePlainName;
  var assistant_request;
  var isStreaming = false;

  if (deviceName.endsWith('AVPHwEuLP-VHBfwz3WxxJrk3ZBGZI5ibpXNpa43WgvrM-qP_A0f2pZQkdq4NiVSd4JqBCMLUvyqGefbpm4maMZ3_rmrrfg')) {

    devicePlainName = 'Indoor Camera';

    assistant_request = getAssistantCommand(devicePlainName);

  } else if (deviceName.endsWith('AVPHwEszKytyX3IjME_0CwnBJKjYZJbB0C9J4e3bvA5rwgO7eYWTBw8_BWJCX_rGYkavK4Vd6TSc_eAMcCFdMLyoCA2Pxw')) {

    devicePlainName = 'Garage Camera';

  }

  var deviceEvent = identifyEvent(messageJson.resourceUpdate.events)

  if(assistant_request != null ) {
  commandAssistant(assistant_request);
  isStreaming = true;
  }

  setTimeout(stopCameraStream, 60000,isStreaming);

  console.log(`Hello, ${devicePlainName}:${deviceEvent}:${assistant_request}`);

  //console.log(request.body)
  response.status(200).json({ received: true });
});


function stopCameraStream(isStreaming) {

  //console.log(`timer func..${isStreaming}`)
  if (isStreaming) {
    var assistant_command = getAssistantCommand('Camera');
    commandAssistant(assistant_command);
    isStreaming = false;
  }


}

function commandAssistant(assistant_request) {

  console.log(`assistant_request..: ${assistant_request}`)
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


function identifyEvent(events) {

  
  var deviceEvent = events["sdm.devices.events.CameraSound.Sound"];

  if (deviceEvent == null) {
    deviceEvent = events["ssdm.devices.events.CameraMotion.Motion"];

    if (deviceEvent == null) {

    } else {

      deviceEvent = 'Motion';
    }

  } else {

    deviceEvent = 'Sound';
  }
  return deviceEvent;
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

