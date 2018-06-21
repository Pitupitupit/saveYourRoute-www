module.exports = function(req, res, next){
	console.log('letOnlyLogged.js: middleware: req.session.stringify: '+JSON.stringify(req.session));
	var userRef = req.session.userRef;
	if(userRef) {
		console.log('1');
		next();
	}
	else {
		console.log('2');
		res.error('You must be logged in to see this page!');
		res.redirect('/login');
	}
};