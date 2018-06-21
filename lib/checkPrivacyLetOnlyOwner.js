var dbfunctions = require('../db/dbfunctions.js');

module.exports = function(req, res, next){
	console.log('checkPrivacyLetonlyOwne.js');
	dbfunctions.selectPrivateAndOwnerFromRoute(req.params.routeref, function(exists, priv, owner){
		if(exists == 0)
		{
			res.error('There is no such route!');
			res.redirect('/');
		}
		else
		{
		
			if(priv == 0) 
				next();
			else
			{
				if(priv == 1 && owner == req.session.userRef)
				{
					next();
				}
				else
				{
					res.error('This route is private! Only owner can see it.');
					res.redirect('/');
				}
			}
		}
	});
};