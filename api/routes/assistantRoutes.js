const express = require('express');
const http = require('http')

const router = express.Router();
require('console-stamp')(console, { pattern: 'mm/dd/yyyy HH:MM:ss.l' });
const LIGHT_COMMAND = 'action device';
const CAMERA_COMMAND = 'action device on Hub';
const GARAGE_CAM_NAME = 'Garage Camera';
const FRONT_CAM_NAME = 'Front Door';
const TUBELIGHT_NAME = 'Tube Light';
const DEVICE_TYPE_CAMERA = 'Camera';
const ON = 'ON';
const OFF = 'OFF';
const SHOW = 'Show';

router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
setInterval(energySaver, 1000 * 60 * 15);
setInterval(timerCount, 1000 * 60 * 1);


var last_action = 'None';
var garage_camera = OFF;
var front_camera = OFF;
var tubelight = OFF;
var tubelight_timer = 0;
var front_camera_timer = 0;
var state_change = false;


router.post('/command', function (request, response) {

  //console.log(JSON.stringify(request.body));

  last_action = request.body.command;
  console.log(`Last action ${last_action}`);

  //const commandJson = request.body.command;
  commandAssistant(JSON.stringify(request.body));

  response.status(200).json({ notified: true });

});


router.post('/passthru/command', function (request, response) {

  console.info(`Assistant Passthru command: ${JSON.stringify(request.body)}`);

  const message = request.body;

  const device_name = request.body.device_name;
  const device_type = request.body.device_type;
  const action = request.body.action;

  if (device_name == GARAGE_CAM_NAME) {

    if (garage_camera == OFF) {
      garage_camera = ON;
      front_camera = OFF;
      state_change = true;
    }

  } else if (device_name == FRONT_CAM_NAME) {
    if (front_camera == OFF) {
      garage_camera = OFF;
      front_camera = ON;
      front_camera_timer = 0;
      state_change = true;
    }

  } else if (device_name == TUBELIGHT_NAME) {
    if (tubelight == OFF) {
      tubelight_timer = 0;
      tubelight = ON;
      state_change = true;
    }

  }


  if (state_change) {
    const command = getAssistantCommand(device_name, action, device_type);

    console.info(`Assistant Command..: ${command}`);

    commandAssistant(command);
    state_change = false;
  }

  response.status(200).json({ notified: true });

});


function timerCount() {

  console.info('Timer..Count');

  tubelight_timer = tubelight_timer + 1;
  front_camera_timer = front_camera_timer + 1;
}

function energySaver() {

  console.info(`Energy saver called.. Tube Light State: ${tubelight}, Timer ${tubelight_timer} and Front Cam State: ${front_camera}, Time: ${front_camera_timer}`);

  if (tubelight == ON) {
    if (tubelight_timer >= 15) {

      const command = getAssistantCommand(TUBELIGHT_NAME, OFF, DEVICE_TYPE_CAMERA);

      commandAssistant(command);

      tubelight = OFF;

      console.info(`Tube Light turned ${OFF} by Energy Saver`);
    }
  } else if (front_camera == ON) {
    if (front_camera_timer >= 15) {
      const command = getAssistantCommand(GARAGE_CAM_NAME, SHOW, DEVICE_TYPE_CAMERA);
      commandAssistant(command);
      front_camera == OFF;
      console.info(`Garage camera stream bu Energy Saver`);

    }

  }



}


function getAssistantCommand(device_name, action, device_type) {

  var command;
  if (device_type == 'Camera') {
    command = CAMERA_COMMAND.replace('device', device_name).replace('action', action);
    //console.info(command);

  } else if (device_type == 'Light') {

    command = LIGHT_COMMAND.replace('device', device_name).replace('action', action);
    //console.info(command);

  }
  const command_json = `
{
   
    "command": "${command}",
    "converse": false,
    "user": "techsudhagar@gmail.com" 

}
`
  return command_json;
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

  console.info(`Assistant Command Executed`);

}

module.exports = router;



