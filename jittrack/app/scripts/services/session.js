'use strict';

angular.module('jittrackApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
