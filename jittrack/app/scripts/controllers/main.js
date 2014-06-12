'use strict';

angular.module('jittrackApp').controller('MainCtrl',
    function ($scope, $http, $log, $document,flexyLayoutService, $window) {
        $http.get('/api/awesomeThings').success(function (awesomeThings) {
            $scope.awesomeThings = awesomeThings;
        });
        $scope.toggleLeft = function(){
            $scope.collapsedLeft = $scope.collapsedLeft==true?false:true;
            flexyLayoutService.toggleBlock('leftSidebar',$scope.collapsedLeft);
        }
        $scope.toggleRight = function(){
            $scope.collapsedRight = $scope.collapsedRight==true?false:true;
            flexyLayoutService.toggleBlock('rightSidebar',$scope.collapsedRight);
        }
        $scope.toggleBottom = function(){
            $scope.collapsedBottom = $scope.collapsedBottom==true?false:true;
            flexyLayoutService.toggleBlock('bottomSidebar',$scope.collapsedBottom);
        }
        $scope.toggleMain = function(){
            $scope.collapsedMain = $scope.collapsedMain==true?false:true;
            flexyLayoutService.toggleBlock('content',$scope.collapsedMain);
        }
        
        $scope.today = function() {
            $scope.dt = new Date();
          };
          $scope.today();

          $scope.showWeeks = true;
          $scope.toggleWeeks = function () {
            $scope.showWeeks = ! $scope.showWeeks;
          };

          $scope.clear = function () {
            $scope.dt = null;
          };

          $scope.disabled = function(date, mode) {
              return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
            };
          
          $scope.toggleMin = function() {
            $scope.minDate = ( $scope.minDate ) ? null : new Date();
          };
          $scope.toggleMin();

          $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
          };

          $scope.dateOptions = {
            'year-format': "'yy'",
            'starting-day': 1
          };
          
          L.Browser.touch=true;
          var map = L.map('map').setView([51.505, -0.09], 13);
         
          L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
              maxZoom: 18
          }).addTo(map);
    });