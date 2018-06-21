var dbfunctions = require('../db/dbfunctions.js');

module.exports = function(req, res, next){
	console.log('letOnlyOwner.js: middleware: req.session.stringify: '+JSON.stringify(req.session));
	var userRef = req.session.userRef;
	dbfunctions.selectPrivateAndOwnerFromRoute(req.params.routeref, function(exists, priv, owner){
		console.log('userRef z sesji: '+userRef);
		console.log('owner z trasy: '+owner);
		if(exists == 0)
		{
			res.error('There is no such route!');
			res.redirect('/');
		}
		else
		{
			if(owner == userRef)
			{
				next();
			}
			else
			{
				res.error('Only owner can edit route!');
				res.redirect('/');
			}
		}
	});
};