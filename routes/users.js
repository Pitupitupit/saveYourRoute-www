var dbfunctions = require('../db/dbfunctions.js');
var User = require('../models/user');
var bcrypt = require('bcryptjs');

exports.editAccount = function(req,res,next){
	res.render('editAccount');
};

exports.editAccountPost = function(req,res,next){
	var userEdit = req.body.userEdit;
	
	console.log('DLACZEHOG XD');
	
	if(userEdit.name.length < 3)
		res.error('Login must contain min. 3 characters');
	else if(userEdit.name.length > 18)
		res.error('Login can\'t contain more than 18 characters');
	
	if(!userEdit.name.match(/^[a-z0-9_]+$/i))
		res.error('Login must contain only alphanumeric characters (also not Polish chars.)');
	
	if(userEdit.pass.length < 5)
		res.error('Pasword must contain min. 5 characters');
	else if(userEdit.pass.length > 100)
		res.error('Login can\'t contain more than 100 characters');
	
	console.log('DLACZEHOG XD');
	
	if(req.session.hasOwnProperty('messages') && req.session.messages.length > 0)
	{
		console.log('DLACZEHOG XD');
		console.log("ASDFASDFASDFASDF");
		res.render('editAccount');
		return;
	}
	else
	{	
		console.log("KKKKKKKKKKKKKKKKKKKKKKKKKKKKK");
		console.log('userEdit: '+JSON.stringify(userEdit));
		console.log('req.user: '+JSON.stringify(req.user));
		
		dbfunctions.selectUserByLogin(userEdit.name, function(err, user){
			if(err) throw err; 
			if(user.length > 0 && user[0].LOGIN != req.user.LOGIN)
			{
				console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPP");
				console.log('nazwa zajęta!');
				res.error('This login is taken by another user!');
				res.render('editAccount');
				return;
			}
			else
			{
				hashPassExisingUser(userEdit.pass, req.user.SALT, function(newHash){
				
					dbfunctions.updateUser({login: userEdit.name, pass: newHash, ref: req.user.REF}, function(){
						console.log("ĄĄĄĄĄĄĄĄĄĄĄĄĄĄĄĄĄĄĄ");
						res.info('Account information has been changed!');
						res.redirect('/editAccount');
						return;
					});
				});
			}
		});
	
	}
};

hashPassExisingUser = function hashPassExisingUser(newPass, salt, callback){
	bcrypt.hash(newPass, salt, function(err, hash){ 
		if(err) throw err;
		callback(hash);
	});
};
