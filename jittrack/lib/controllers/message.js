'use strict';

var mongoose = require('mongoose'),
    Message = mongoose.model('Message'),
	User = mongoose.model('User');
/**
 * Send Message
 */
exports.send = function(req, res, next){
	var newMessage = new Message(req.body);
	newMessage.save(function(err){
		if (err) return res.json(400, err);
		return res.json(newMessage);	
	});
};

/**
 * Get message for a user
 * to user -
 * 
 */
exports.recent = function(req, res, next){
	var toUser = req.body.to;
	var aggrCond = [{$match:{to:toUser}},{$sort: {date:-1}},{$group:{_id:'$from',date:{$first:'$date'},message:{$first:'$message'}}}];
	Message.aggregate([{$match:{to:toUser}},{$group:{from:"$from",date:{$max:"$date"}}}]);
};

/**
 * Create user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.save(function(err) {
    if (err) return res.json(400, err);
    
    req.logIn(newUser, function(err) {
      if (err) return next(err);

      return res.json(req.user.userInfo);
    });
  });
};

/**
 *  Get profile of specified user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(404);

    res.send({ profile: user.profile });
  });
};

/**
 * Change password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return res.send(400);

        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get current user
 */
exports.me = function(req, res) {
  res.json(req.user || null);
};