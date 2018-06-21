var dbfunctions = require('../db/dbfunctions');

exports.yourLocations = function(req, res, next){
	var userRef = req.session.userRef;
	dbfunctions.yourLocations(userRef, function(locations){
		var links = [];
		
		locations.forEach(function(loc){
			var link = '/location/'+loc.REF;
			links.push(link);
			console.log(link);
		});
			
		res.locals.locations = locations;
		res.locals.links = links;
		res.render('iindex');
	});
	
};

exports.location = function(req, res, next){
	var locationRef = req.params.locationref;
	console.log('locationRef: '+locationRef);
	dbfunctions.selectLocationByRef(locationRef, function(loc){
		console.log('loc stringify: '+JSON.stringify(loc));
		res.locals.loc = loc;
		res.render('location');
	});
	
};

exports.deleteLocation = function(req, res, next){
//	var locationRef = req.body.locationRef.ref;
	console.log('req STRINGIYF:'+JSON.stringify(req.body));
	console.log('locationRef: '+locationRef);
	dbfunctions.deleteLocationByRef(locationRef, function(deletedLocationName){
		res.info('You have successfully deleted your location: '+deletedLocationName);
		next();
	});
	
};
