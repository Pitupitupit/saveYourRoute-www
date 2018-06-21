var User = require('../models/user');

exports.sendForm = function(req, res){
	res.render('login', { title: 'Logowanie' });
};

exports.submitForm = function(req, res, next){
	console.log('submitForm: login: '+req.body.user.name);
	console.log('submitForm: pass: '+req.body.user.pass);
	var data = req.body.user;
	User.auth(data.name, data.pass, function(err, user){
		if(err) return next(err);
		console.log('login.js: submitForm: user.stringify: '+JSON.stringify(user));
		if(user){
			req.session.userRef = user.REF;
			res.info('Hi '+user.LOGIN+'! You have been successfully logged in!');
			res.redirect('/');
		}
		else {
			res.error('Przepraszamy. Nieprawidłowe dane!');
			res.redirect('back');
		}
	});
};

exports.logout = function(req, res, next){
	req.session.destroy(function(err){
		if(err) throw err;
		res.redirect('/');
	});
};