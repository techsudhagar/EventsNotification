const express = require('express');
const http = require('http')

const router = express.Router();
require('console-stamp')(console, { pattern: 'mm/dd/yyyy HH:MM:ss.l' });


router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
setInterval(garageDoorOpenNotify, 1000 * 60 * 15 );
var last_action = 'None';


router.post('/command', function(request, response){

    //console.log(JSON.stringify(request.body));
    
    last_action = request.body.command;
    console.log(`Last action ${last_action}`);

    //const commandJson = request.body.command;
    commandAssistant(JSON.stringify(request.body));

    response.status(200).json({ notified: true });

});

function garageDoorOpenNotify(){

    if(last_action == 'Garage door is opened') {

        commandAssistant(getAssistantCommand('opened'));
    }

}

function getAssistantCommand(action) {
const command_json = `
{
   
    "command": "Garage door is ${action}",
    "broadcast": true,
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
