'use strict';

/**
 * Custom middleware used by the application
 */
var helper = require('./utility/helper')
module.exports = {

  /**
   *  Protect routes on your api from unauthenticated access
   */
  auth: function auth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send(401);
  },

  /**
   * Set a cookie for angular so it knows we have an http session
   */
  setUserCookie: function(req, res, next) {
    if(req.user && !req.cookies.user) {
      res.cookie('user',JSON.stringify(req.user.userInfo));
      res.cookie('userId',JSON.stringify(helper.longToShort(req.user.id)));
      res.cookie('token',JSON.stringify(helper.longToShort(helper.sha256(req.user.id))));
    }
    next();
  },
  
  /**
   * Set a CSRF token, to avoid forgery 
   */
  setCSRF: function(req, res, next) {
      res.cookie('XSRF-TOKEN', req.csrfToken());
      next();
   }
};