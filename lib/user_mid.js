var User = require('../models/user');
var dbfunctions = require('../db/dbfunctions');

module.exports = function(req, res, next){
	var userRef = req.session.userRef;
	if(userRef){
		dbfunctions.selectUserByRef(userRef, function(err, user){
			if(err) return next(err);
			if(user.length == 0) return next();
			req.user = res.locals.user = user[0];
			console.log('user_mid.js: res.locals.user po przypisaniu do niej usera: '+JSON.stringify(req.user));
			next();
		});
	}
	else ////!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		next();
};