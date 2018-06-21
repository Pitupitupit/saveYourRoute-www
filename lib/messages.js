var express = require('express');
var res = express.response; //prototyp response

//funkcja do dodania komunikatu do sesji.
res.message = function(msg, type){ //teraz wszêdzie res.message jest dostêpny - wszystkie trasy i metody poœred.
	type = type || 'info';
	var sess = this.req.session; //sess - zmienna sesji
	sess.messages = sess.messages || []; //puste->nie rób talibcy bo ju¿ jest, niepuste ->rób tablicê
	sess.messages.push({type: type, string: msg});
};

res.error = function(msg){ 				//dodawanie do kolejki nowego komunikatu typu error
	return this.message(msg, 'error');
};

res.info = function(msg){ 				//dodawanie do kolejki nowego komunikatu typu error
	return this.message(msg, 'info');
};

//metoda poœrednicz¹ca (app.use(messages)) - 
module.exports = function(req, res, next){
	res.locals.messages = req.session.messages || []; //przypisanie do locals (by widoki mia³y) komunikatów z sesji.messages
	res.locals.removeMessages = function(){//po prostu usuniêcie z sesji komunikatow
		req.session.messages = [];
	};
	next();
};