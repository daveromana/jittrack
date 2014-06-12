/**
 * @author Sanket
 */
var faye = require('faye');

// faye server
/**
 * Express configuration
 */
module.exports = function(app,sessionStore) {

        var fayeServer  =   new faye.NodeAdapter({
            mount:      '/faye',
            timeout:    45
        });
        
        //Get clients bayeux
        fayeServer.getClient(function(){
            console.log("New server client connected");
        });
        
        fayeServer.on('handshake', function(clientId) {
            console.log("New browser client connected - " + clientId);
        });
        
        fayeServer.on('subscribe', function(clientId, channel) {
            console.log("ClientId - " + clientId + " subscribed for the channel - " + channel);
            console.log("Testing Channel");
            fayeServer.getClient().publish(channel, 'Testing channel - ' + channel);
        });
        
        var extension = {
                incoming: function(message, request, callback) {
                    message.ext = message.ext || {};
                    if (message.channel !== '/meta/subscribe')
                        return callback(message);
                    
                    callback(message);
                  } 
        }
        
        fayeServer.addExtension(extension);
        return fayeServer;
};