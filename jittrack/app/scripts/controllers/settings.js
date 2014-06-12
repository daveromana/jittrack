'use strict';

angular.module('jittrackApp')
  .controller('SettingsCtrl', function ($scope, $log, User, Auth, client) {
    $log.log("Client Connected - " + client.isConnected());
    client.subscribe('/random',function(message){
        $log.log(message); 
    });
    client.publish('/random','Publishing dummy message');
        
    $scope.errors = {};

    $scope.changePassword = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
        });
      }
		};
  });
