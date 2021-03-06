const express = require('express');
const http = require('http')
const assistant = require('./assistantInvoke');

const router = express.Router();
require('console-stamp')(console, { pattern: 'mm/dd/yyyy HH:MM:ss.l' });
const EVENT_VERBOSE = 'Type of event received is ';
const EVENT_TYPE_SOUND = 'Sound';
const EVENT_TYPE_MOTION = 'Motion';
const EVENT_TYPE_PERSON = 'Person';

let secondsElapsed = 0;
const STREAM_PERIOD = 61; // Seconds

router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//setInterval(secondsElapsedAction, 1000);

router.post('/sensor/kidslight/notify', function (request, response) {

  console.info('Front sensor received motion notification');

  assistant.turnLightState('ON','Tube Light');

  response.status(200).json({ received: true });


});


router.post('/notify', function (request, response) {

  console.info('Event notification received..');
  console.info(request.body);


  const message = request.body.message.data
    ? Buffer.from(request.body.message.data, 'base64').toString()
    : '';


  console.info(`Event message..: ${message}`);

  // const deviceName = message.name;
  const messageJson = JSON.parse(message);
  const deviceName = messageJson.resourceUpdate.name;

  //console.log(`Event received from the Device Name..: ${deviceName}`);

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
  console.info(`${EVENT_VERBOSE} ${device_event_type} `);

  if (device_event_type != null && (device_event_type == EVENT_TYPE_MOTION || device_event_type == EVENT_TYPE_PERSON)) {

    if (devicePlainName != null && devicePlainName == 'Garage Camera') {

    
      assistant_request = getPassthruCommand(devicePlainName);

      commandPassthruAssistant(assistant_request);
      isStreaming = true;
      secondsElapsed = 0;
      console.info(`Timer count reset to ${secondsElapsed}`);
     
    }

  }

  console.info('Event addressed');
  console.info('==================');
  //console.log(request.body)
  response.status(200).json({ received: true });
});

function commandPassthruAssistant(assistant_request) {

  //console.log(`assistant_request..: ${assistant_request}`)
  console.info(`Assistant Passthru Command Executing..:${assistant_request}`);
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/assistant/passthru/command',
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

  console.info(`Assistant Passthru Command Executed`);

}

function identifyEventType(events) {


  var device_event_type = events["sdm.devices.events.CameraSound.Sound"];

  if (device_event_type == null) {
    device_event_type = events["sdm.devices.events.CameraMotion.Motion"];

    if (device_event_type == null) {

      device_event_type = events["sdm.devices.events.CameraPerson.Person"];

      if (device_event_type != null) {

        device_event_type = EVENT_TYPE_PERSON;
      }

    } else {

      device_event_type = EVENT_TYPE_MOTION;
    }

  } else {

    device_event_type = EVENT_TYPE_SOUND;
  }
  return device_event_type;
}

function getPassthruCommand(device_name) {

  var command_request = `{
    "device_name": "${device_name}",
    "action": "show",
    "device_type": "Camera" 
}`;

  return command_request;

}

module.exports = router;
