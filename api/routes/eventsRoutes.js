const express = require('express');
const router = express.Router();




router.post('/notify', function(request, response){

  console.log('Notification Received');

  console.log();

  response.status(200).json({received: true});

});

module.exports = router;
