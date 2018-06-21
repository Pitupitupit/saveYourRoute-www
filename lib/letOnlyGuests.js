module.exports = function(req, res, next){
	console.log('letOnlyGuests.js: middleware: req.session.stringify: '+JSON.stringify(req.session));
	var userRef = req.session.userRef;
	if(userRef) {
		console.log('1');
		res.redirect('/');
	}
	else {
		console.log('2');
		next();
	}
};