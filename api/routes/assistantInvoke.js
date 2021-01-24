
const http = require('http');
let tubelight_on_count = 0;
const NO_MOTION_DURATION = 1000 * 60 * 15; //mins


require('console-stamp')(console, { pattern: 'mm/dd/yyyy HH:MM:ss.l' });

setInterval(elapsedAction, 1000);


function turnLightState(state,device) {
  console.info(` Turning ${device} state to ${state}.`);

  if(state == 'ON') {
    tubelight_on_count = 0;
  }

  const command = `{
		"command": "Turn ${state} ${device}",
		"converse": false,
		"user": "techsudhagar@gmail.com" 
		}`;


  commandAssistant(command);

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

function elapsedAction() {

  tubelight_on_count = tubelight_on_count + 1;

  if (tubelight_on_count % 60 == 0) {
    console.info(` Timer action elapsed  ${tubelight_on_count}`);
  }


  if (tubelight_on_count >= NO_MOTION_DURATION) {

    turnLightState('OFF'),'Tube Light';
  }

}

module.exports = { turnLightState };
