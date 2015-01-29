var express = require('express');
var router = express.Router();

var PATH_TO_DECRYPT_UTILS_SCRIPT = "C:\\pathto\\decryptUtil.ps1";
var PATH_TO_ENCRYPTED_CREDENTIALS_FILE = "C:\\pathto\\encrypted.credentials";
var PATH_TO_SECRET_KEY = "C:\\pathto\\secret.key";

var o365Utils = require('../../powershell-command-executor/o365Utils');
var PSCommandService = require('../../powershell-command-executor');
var StatefulProcessCommandProxy = require('../../stateful-process-command-proxy');


var statefulProcessCommandProxy = new StatefulProcessCommandProxy({
  name: "StatefulProcessCommandProxy",
  max: 1,
  min: 1,
  idleTimeoutMS: 120000,
  log: function(severity,origin,msg) {
    console.log(severity.toUpperCase() + " " +origin+" "+ msg);
  },

  processCommand: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
  processArgs:    ['-Command','-'],


  processRetainMaxCmdHistory : 20,
  processInvalidateOnRegex : {
    'any':[],
    'stdout':[],
    'stderr':['.*error.*'] // anything comes in on stderr, w/ "error"... invalidate it
  },
  processCwd : null,
  processEnvMap : null,
  processUid : null,
  processGid : null,

  initCommands: o365Utils.getO365PSInitCommands(
                  PATH_TO_DECRYPT_UTILS_SCRIPT,
                  PATH_TO_ENCRYPTED_CREDENTIALS_FILE,
                  PATH_TO_SECRET_KEY,
                  10000,30000,60000),


    validateFunction: function(processProxy) {
      return processProxy.isValid();
    },


    preDestroyCommands: o365Utils.getO365PSDestroyCommands(),

    processCmdBlacklistRegex: o365Utils.getO365BlacklistedCommands(),

    processCmdWhitelistRegex: o365Utils.getO365WhitelistedCommands(),

    autoInvalidationConfig: o365Utils.getO365AutoInvalidationConfig(30000)

  });

var myLogFunction = function(severity,origin,message) {
  console.log(severity.toUpperCase() + ' ' + origin + ' ' + message);
}

var psCommandService = new PSCommandService(statefulProcessCommandProxy,
                                            o365Utils.o365CommandRegistry,
                                            myLogFunction);


/* GET - console page */
router.get('/', function(req, res, next) {
  res.sendFile('console.html', { root: './public'});
});

// GET commands
router.get('/command/:commandName?', function(req, res, next) {

  if (req.params.commandName) {
      res.send(o365Utils.o365CommandRegistry[req.params.commandName]);
  } else {
      res.send(psCommandService.getAvailableCommands());
  }

});

// GET command-service status
router.get('/command-service/status', function(req, res, next) {
    var status = psCommandService.getStatus();
    res.send(status);
});

// POST (execute command)
router.post('/command/execute/:commandName', function(req, res, next) {
  psCommandService.execute(req.params.commandName,req.body)
      .then(function(cmdResult) {
          res.send(cmdResult);
      }).catch(function(error) {
          res.send({'error': { 'name': error.name, 'message': error.message, 'stack':error.stack}});
      });
});

// POST (generate command statement)
router.post('/command/generate/:commandName', function(req, res, next) {
    var command = psCommandService.generateCommand(req.params.commandName,req.body);
    res.send({'command': command});
});

module.exports = router;
