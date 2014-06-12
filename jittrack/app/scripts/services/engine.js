/*
 * author: Sanket Bajoria
 */
'use strict';

angular.module('jittrackApp').provider('client', function () {
    var options = {};
    this.options = function (value) {
        options = value || {};
    };
    this.$get = function ClientProvider($rootScope, $location, $log, $window, $cookieStore, $cookies, Auth) {
        var defaultScope = options.scope || $rootScope;
        var onConnect = options.onConnect || angular.noop;
        var onDisconnect = options.onDisconnect || angular.noop;
        var port = options.port || $location.port();
        var host = options.host || $location.host();
        var subscription = {};
        var timeout = options.timeout || 1 * 45; // 1
        var uri = 'http://'+host+':'+port+'/faye';
        //$log.log('formed path - '+ uri);
        var client = new Faye.Client(uri,{timeout:timeout});
        client.on('transport:up', function() {
            //$log.log("Client is up");
            onConnect();
        });
        client.on('transport:down', function() {
//            /$log.log("Client is down");
            onDisconnect();
        });
        client.connect(function(){
            //$log.log('Connecting client');
        });
        var extension = {
                incoming: function(message, callback) {
                  $log.log('incoming', message);
                  message.ext = message.ext || {};
                  if((message.ext["clientId"] && message.ext["clientId"] == client._clientId) || (message.ext["userId"] && message.ext["userId"] == $cookieStore.get('userId'))){
                      message =  null;
                  }
                  callback(message);
                },
                outgoing: function(message, callback) {
                  $log.log('outgoing', message);
                  message.ext = message.ext || {};
                  if (message.channel !== '/meta/subscribe')
                      return callback(message);
                  if(client._clientId){message.ext["clientId"] = client._clientId;}
                  if(Auth.isLoggedIn()){
                      message.ext['userId'] = $cookieStore.get('userId');
                      message.ext['token'] = $cookieStore.get('token');
                  }
                  callback(message);
                }
              };
        client.addExtension(extension);

        var wrappedSocket = {
            publish: function (channel, message) {
                $log.log('Publishing message (' + message + ') on channel (', channel, ')');
                var publication = client.publish(channel, message);
                publication.then(function() {
                  $log.log('Message received by server!');
                }, function(error) {
                  $log.log('There was a problem: ' + error.message);
                });
            },
            isConnected: function () {
                return client._state == client.CONNECTED;
            },
            getChannels: function() {
                return subscription;
            },
            subscribe: function(channel,callback){
                $log.log("Subscribing for channel - "+ channel);
                var cb = callback || angular.noop;
                subscription[channel] = client.subscribe(channel,function(message){
                    $log.log('Received message (' + message + ') for channel (' + channel + ')');
                    var args = arguments;
                    defaultScope.$apply(function(){
                       cb.apply(client, args); 
                    });
                });
                subscription[channel].then(function(){
                   $log.log('Subscription is active for channel - '+channel); 
                });
                return subscription[channel];
            },
            cancelSubscription: function(channel){
                if(channel && subscription[channel]){
                    subscription[channel].cancel();
                }
            },
            getClientId: function(){
                return client._clientId;
            }
        };
        return wrappedSocket;
    };
})
angular.element(document).ready(function () {
    angular.module('jittrackApp').config(function (clientProvider) {
        clientProvider.options({});
    });
});