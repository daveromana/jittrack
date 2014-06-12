'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	User = require('./user');
/**
 * Message Schema
 */
var MessageSchema = new Schema({
  from: {type: ObjectId,ref:"User",required:'Message send from invalid user'},
  to: {type: ObjectId,ref:"User",required:'Message send to invalid user'},
  date: {type:Date, required:'Message Date cannot be empty', default: Date.now},
  message: String,
  read: {type:Boolean, default: false}   
});
  
/**
 * Virtuals
 */


/**
 * Validations
 */

// Validate from user ID
MessageSchema
  .path('from')
  .validate(function(from,respond) {
	  User.findById(from, function (err, user) {
		    if (err) throw err;
		    if (!user) return respond(false);
		    return respond(true);
		    });
	  }, 'Message send from invalid user');

//Validate to user ID
MessageSchema
  .path('to')
  .validate(function(to,respond){
	  User.findById(to, function (err, user) {
		    if (err) throw err;
		    if (!user) return respond(false);
		    return respond(true);
		    }); 
	  }, 'Message send to invalid user');


var validatePresenceOf = function(value) {
  return value && value.length;
};


module.exports = mongoose.model('Message', MessageSchema);