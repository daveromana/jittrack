'use strict';

angular.module('jittrackApp')
  .controller('MessageCtrl', function ($scope, $filter, $rootScope) {
    $scope.messages=[];
    $scope.showSplitter = function(index){
        if(!(index>0 && $filter('date')($scope.messages[index].dateTime,"dd-MM-yyyy")==$filter('date')($scope.messages[index-1].dateTime,"dd-MM-yyyy"))){
            return true; 
        }
        return false;
    };
    $scope.sendMessage = function(form){
        $scope.submitted = true;
        if(form.$valid) {
            $scope.messages.push({text:$scope.newMessage,
                                  dateTime: Date.now(),
                                  user: $rootScope.currentUser.name
                                  });
        }  
    };

  });