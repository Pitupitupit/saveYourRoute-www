var dbfunctions = require('../db/dbfunctions');
var bcrypt = require('bcryptjs');

module.exports = User;

function User(obj) {
	for(var key in obj){
		this[key] = obj[key];
	}
}

User.prototype.save = function(fn){
	var user = this;
	user.hashPassword(function(err){ //mamy zahashowane hasło (pass) i salt
		if(err) return fn(err);
		dbfunctions.insertUser(user, function(err, ref){ //zwraca refa dodanego usera
			if(err) return fn(err);
			console.log('Dodano użytkownika: '+user.login);
			fn(null,ref);
		});
	});
	//to-do sprawdzenie czy istnieje już taki login
}

User.prototype.hashPassword = function(fn){
	var user = this;
	bcrypt.genSalt(12, function(err, salt){ // generowanie 12-znakowego ciągu zaburzającego
		if(err) return fn(err);
		user.salt = salt;
		console.log('userpass: '+user.pass);
		console.log('salt: '+salt);
		bcrypt.hash(user.pass, salt, function(err, hash){
			if(err) return fn(err);
			user.pass = hash; //zapisanie do pass zahashowanego hasła
			fn();
		});
	});
}

/*User.getUserByLogin = function(login, fn){
	dbfunctions.selectUserRefByLogin(login, function(ref){
		dbfunctions.selectUserByRef(ref, function(user){
			fn(user);
		});
	});
};*/

//ZMIENIC NA TABLICE WYNIK DB
User.auth = function(loginIn, passIn, fn){
	console.log('user.js User.auth co ja robię tu');
	dbfunctions.selectUserByLogin(loginIn, function(err, user){
		if(err) return fn(err); 
		console.log('user.js User.auth user stringify: '+JSON.stringify(user));
		if(user.length == 0) return fn(); //(pusty obiekt? TABLICA) nie ma takiego logina
		console.log('passIn:'+passIn+' user[0].SALT:'+user[0].SALT);
		bcrypt.hash(passIn, user[0].SALT, function(err, hash){ 
			if(err) return fn(err);
			console.log('!!!h '+hash);
			console.log('!!!p '+user[0].PASS);
			console.log('user.js: User.auth: user[0]stringify: '+JSON.stringify(user[0]));
			if(hash == user[0].PASS) 
			{
				console.log('user.js: user.auth: hash == user[0].pass ');
				return fn(null, new User(user[0])); //[0]?
			}
			console.log('hash != user[0].pass');
			fn();
		});
	});
};

User.hashPassExisingUser = function(newPass, salt, callback){
	bcrypt.hash(newPass, salt, function(err, hash){ 
		if(err) throw err;
		callback(hash);
	});
};
