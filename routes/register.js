var User = require('../models/user');
var dbfunctions = require('../db/dbfunctions');

exports.sendForm = function(req, res) {
	console.log('/register sendForm');
	res.render('register', { title: 'Rejestracja' });
};

exports.submitForm = function(req, res, next) {
	console.log('Rejestracja: wprowadzone dane: '+JSON.stringify(req.body.user));
	var data = req.body.user;
	if(data.name.length < 3)
		res.error('Login musi składać się z minimum 3 znaków.');
	else if(data.name.length > 18)
		res.error('Login nie może zawierać więcej niż 18 znaków.');
	
	if(!data.name.match(/^[a-z0-9_]+$/i))
		res.error('Login może składać się tylko ze znaków alfanumerycznych.');
	
	if(data.pass.length < 5)
		res.error('Hasło musi zawierać minimum 5 znaków.');
	else if(data.pass.length > 100)
		res.error('Hasło nie może zawierać więcej niż 100 znaków.');
	
	console.log('validation session: '+JSON.stringify(req.session));
	
	if(req.session.hasOwnProperty('messages'))
		if(req.session.messages.length > 0){
			res.redirect('back');
			return;
		}
	
	dbfunctions.selectUserByLogin(data.name, function(err, user){
		if(err) return next(err); 
		console.log('register.js submitForm user.stringify (wynik selectUserByLogin): '+ JSON.stringify(user));
		if(user.length > 0) { //istnieje user juz taki
			console.log('nazwa zajęta!');
			res.error('Podana nazwa użytkownika jest już zajęta :(');
			res.redirect('back');
		}
		else {
			user = new User({login: data.name, pass: data.pass});
			user.save(function(err,newRef){
				if(err) return next(err);
				req.session.userRef = newRef;
				console.log('zalozono konnto, redirect!');
				res.info('Your account has been created!');
				res.redirect('/'); //przekierowanie w razie sukcesu rejestracji. Przy przekierowaniu res.locals się zerują.
			});
		}
	});
	
};