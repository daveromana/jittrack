'use strict';

angular.module('jittrackApp')
  .controller('NavbarCtrl', function ($scope, $location, $rootScope, Auth) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }, {
      'title': 'Settings',
      'link': '/settings'
    },{
        'title': 'Message',
        'link': '/message'
      }];
    
    $scope.logout = function() {
      Auth.logout()
      .then(function() {
        $location.path('/login');
      });
    };
    
    $scope.isActive = function(route) {
      return route === $location.path();
    };
    
    $scope.currentUser = function(){
        return $rootScope.currentUser;
    };
    
    $scope.toggleLeft = function(){
        $rootScope.$broadcast('toggleLeft');
    }
  });
