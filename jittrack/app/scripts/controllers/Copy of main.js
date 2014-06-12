'use strict';

angular.module('jittrackApp').controller('MainCtrl',
    function ($scope, $http, $log, $document) {
        var $content = angular.element('.content');
        var $leftSidebar = angular.element('.leftSidebar');
        var $rightSidebar = angular.element('.rightSidebar');
        
        $scope.leftWidth = $leftSidebar.width();
        $scope.rightWidth = $rightSidebar.width();
        $content.width($document.width()-$scope.leftWidth-$scope.rightWidth);
        $scope.collapsedLeft = false;
        $scope.collapsedRight = false;
        
        $scope.dragLeft = function($diffPos){
            $leftSidebar.width($leftSidebar.width() + $diffPos.x);
            $content.width($content.width() - $diffPos.x);
        }
        $scope.toggleLeft = function(){
            $leftSidebar.animate({width:($scope.collapsedLeft?$scope.leftWidth+'px':'0px')}, 
                    {duration:500,
                     step: function(now, fx) {
                          $content.width($document.width()-now-$rightSidebar.width());
                        }
                    }
                    
                    );
                $scope.collapsedLeft = !$scope.collapsedLeft;
        }
        $scope.toggleRight = function(){
            $rightSidebar.animate({width:($scope.collapsedRight?$scope.rightWidth+'px':'0px')}, 
                    {duration:500,
                    step: function(now, fx) {c
                     $content.width($document.width()-now-$leftSidebar.width());
                   }
               });
            $scope.collapsedRight = !$scope.collapsedRight;
        }
        $http.get('/api/awesomeThings').success(function (awesomeThings) {
            $scope.awesomeThings = awesomeThings;
        });
    });