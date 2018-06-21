var express = require('express');
var res = express.response; //prototyp response

//funkcja do dodania komunikatu do sesji.
res.message = function(msg, type){ //teraz wsz�dzie res.message jest dost�pny - wszystkie trasy i metody po�red.
	type = type || 'info';
	var sess = this.req.session; //sess - zmienna sesji
	sess.messages = sess.messages || []; //puste->nie r�b talibcy bo ju� jest, niepuste ->r�b tablic�
	sess.messages.push({type: type, string: msg});
};

res.error = function(msg){ 				//dodawanie do kolejki nowego komunikatu typu error
	return this.message(msg, 'error');
};

res.info = function(msg){ 				//dodawanie do kolejki nowego komunikatu typu error
	return this.message(msg, 'info');
};

//metoda po�rednicz�ca (app.use(messages)) - 
module.exports = function(req, res, next){
	res.locals.messages = req.session.messages || []; //przypisanie do locals (by widoki mia�y) komunikat�w z sesji.messages
	res.locals.removeMessages = function(){//po prostu usuni�cie z sesji komunikatow
		req.session.messages = [];
	};
	next();
};