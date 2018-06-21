var dbfunctions = require('../db/dbfunctions');

exports.index = function(req, res, next){
	
	dbfunctions.selectGeneral(function(general){
		
		res.render('index', {general: general});
	});
	
};

exports.generalDets = function(req, res, next){
	
	dbfunctions.selectGeneralDets(function(general){
		
		res.render('generalDets', {general: general});
	});
	
};

exports.googlowe = function(req,res,next){
	res.render('googlowe');
};