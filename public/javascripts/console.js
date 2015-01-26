
var consoleApp = angular.module('consoleApp',['ngResource','ui.bootstrap']);

consoleApp.factory('Command', function($resource) {
  return $resource('/command/:commandName');
});

consoleApp.factory('Execute', function($resource) {
  return $resource('/command/execute/:commandName');
});

consoleApp.factory('Generate', function($resource) {
    return $resource('/command/generate/:commandName');
});

consoleApp.factory('CommandService', function($resource) {
    return $resource('/command-service/:function');
});


// ConsoleController
consoleApp.controller('ConsoleController',
    ['$scope','$http', 'Command','Execute','Generate','CommandService',
    function($scope, $http, Command, Execute, Generate, CommandService) {

    // info about last command execution state
    $scope.executeInfo = {};
    $scope.generateInfo = {};
    $scope.commandService = {};
    $scope.commandForms = {};
    $scope.commandName2ConfigMap = {};
    $scope.commandConfigs = [];

    $scope.isEmpty = function (obj) {
        for (var i in obj) if (obj.hasOwnProperty(i)) return false;
        return true;
    };


    $scope.getCommandConfigs = function() {
       // get all
       $scope.commandConfigs = Command.query(function() {
           for (var i=0; i<$scope.commandConfigs.length; i++) {
               var cmd = $scope.commandConfigs[i];
               $scope.commandForms[cmd.commandName] = {};
               $scope.commandName2ConfigMap[cmd.commandName] = cmd;
           }
       });


    };

    var constructParams = function(commandName, argumentMap) {
        var params = {};
        for (var arg in argumentMap) {
            params[arg] = argumentMap[arg];
        }
        return params;
    }

    $scope.execute = function(commandName) {

        var params = constructParams(commandName, $scope.commandForms[commandName]);
        
        $scope.executeInfo = {};

        $scope.executeInfo.startedAt = new Date();
        $scope.executeInfo.commandName = commandName;
        $scope.executeInfo.arguments = params;

        $scope.executeInfo.cmdResult = Execute.save({'commandName':commandName},params,function() {
            $scope.executeInfo.finishedAt = new Date();
            var cmdConfig = $scope.commandName2ConfigMap[commandName];
            if (cmdConfig.return.type == 'json') {
                if ($scope.executeInfo.cmdResult.stderr.length == 0) {
                    $scope.executeInfo.cmdResult.resultObject = angular.fromJson($scope.executeInfo.cmdResult.stdout);
                }
            }
        });

    };

    $scope.generate = function(commandName) {

        var params = constructParams(commandName, $scope.commandForms[commandName]);

        $scope.generateInfo.commandName = commandName;
        $scope.generateInfo.arguments = params;

        $scope.generateInfo.command = Generate.save({'commandName':commandName},params);

    };



    $scope.getCommandServiceStatus = function() {
        $scope.commandService.status = CommandService.query({'function':"status"});
    };


}]);
