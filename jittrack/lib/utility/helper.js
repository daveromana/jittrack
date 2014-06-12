'use strict';

var ObjectID = require('mongodb').ObjectID,
    crypto = require('crypto');

function shortToLong(shortID) {
	shortID = shortID.replace('-', '+').replace('_', '/');
	var buffer = new Buffer(shortID, 'base64');
	return buffer.toString('hex');
}

function longToShort(longID) {
	var buffer = new Buffer(longID, 'hex');
	return buffer.toString('base64').replace('+', '-').replace('/', '_');
}

function shortToObjectID(shortID) {
	return new ObjectID(shortToLong(shortID));
}

function objectIDtoShort(objectID) {
	return longToShort(objectID.toHexString());
}

/**
 * Generate a login Token
 */
function sha256(id){
    var hmac   = crypto.createHmac('sha256', 'hard to crack it'),
    token = hmac.update(id).digest('hex');
    return token;
}
module.exports = {
	shortToLong:shortToLong,
	longToShort:longToShort,
	l2s:longToShort,
	s2l:shortToLong,
	shortToObjectID:shortToObjectID,
	objectIDtoShort:objectIDtoShort,
	o2s:objectIDtoShort,
	s2o:shortToObjectID,
	sha256: sha256
};
