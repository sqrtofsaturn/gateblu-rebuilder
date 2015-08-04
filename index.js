'use strict'
var _ = require('lodash');
var async = require('async');
var Meshblu = require('meshblu');

if (process.argv.length < 5) {
  console.log('Usage: gateblu-rebuilder <user_uuid> <user_token> <gateblu_uuid>')
  return;
}

console.log(process.argv);

var meshblu = Meshblu.createConnection({
  uuid: process.argv[2],
  token: process.argv[3]
})

var gatebluUuid = process.argv[4]

meshblu.on('ready', function(){
  console.log("Connected to Meshblu, rebuilding Gateblu");
  meshblu.device({uuid: gatebluUuid}, function(result){
    var gatebluDevice = result.device;
    meshblu.mydevices({gateblu: gatebluUuid}, function(result) {
      async.map(result.devices, function(device, cb) {
        meshblu.generateAndStoreToken({uuid: device.uuid}, function(result){
          result.type = device.type;
          result.connector = device.connector;
          cb(null, result);
        })
      }, function(error, result){
        gatebluDevice.devices = result;
        meshblu.update(gatebluDevice, function(){
          console.log("Gateblu Updated...");
          process.exit(0);
        })
      });
    });
  });
});
