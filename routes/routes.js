var express = require('express');
var dbfunctions = require('../db/dbfunctions');
var User = require('../models/user');

exports.routeDets = function(req, res, next) {
	dbfunctions.selectRoute(req.params.routeref,function(title, route){
		/*var ddd = new User({login: 'ananas', pass: 'haslo123'});
		ddd.save(function(err){
			if(err) throw err;
			console.log('Doda');
		});*/
		console.log('routeDets: title: '+title);
		res.render('index', {title: title, route: route});
	});
};

exports.routeDetsFromPoints = function(req, res, next) {
	var viewsCounter;
	console.log("WTF");
	dbfunctions.updateViewCounterReturnCounter(req.params.routeref, function(counter){
		console.log("WTF");
		viewsCounter = counter;
	});
	
	var filter = '';
	var par = req.body.parameters;
	var animate = false; //domyślnie
	var followPoint = false; //domyślnie
	var accSmallerThan; //domyślnie
	var accGreaterThan; //domyślnie
	var provider;
	var satsSmallerThan;
	var satsGreaterThan;
	var seqGreaterThan;
	var seqSmallerThan;
	var sessUserRef = req.session.userRef;
	console.log("SRES: "+sessUserRef);
	
	if(par)
	{
		if(par.accSmallerThan)
		{
			console.log(par.accSmallerThan);
			accSmallerThan = par.accSmallerThan;
			filter += ' and ACCURACY < '+par.accSmallerThan+' ';
		}
		if(par.accGreaterThan)
		{
			console.log(par.accGreaterThan);
			accGreaterThan = par.accGreaterThan;
			filter += ' and ACCURACY > '+par.accGreaterThan+' ';
		}
		if(par.provider)
		{
			console.log(par.provider);
			provider = par.provider;
			if(par.provider != 'all')
				filter += ' and PROVIDER = \''+par.provider+'\' ';
		}
		if(par.satsSmallerThan)
		{
			satsSmallerThan = par.satsSmallerThan;
			console.log(par.satsSmallerThan);
			filter += ' and SATELLITES < '+par.satsSmallerThan+' ';
		}
		if(par.satsGreaterThan)
		{
			satsGreaterThan = par.satsGreaterThan;
			console.log(par.satsGreaterThan);
			filter += ' and SATELLITES > '+par.satsGreaterThan+' ';
		}
		if(par.seqSmallerThan)
		{
			seqSmallerThan = par.seqSmallerThan;
			console.log(par.seqSmallerThan);
			filter += ' and SEQ <= '+par.seqSmallerThan+' ';
		}
		if(par.seqGreaterThan)
		{
			seqGreaterThan = par.seqGreaterThan;
			console.log(par.seqGreaterThan);
			filter += ' and SEQ >= '+par.seqGreaterThan+' ';
		}
		
		if(par.animate)
		{
			animate = true;
		}
		else
		{
			animate = false;
		}

		if(par.followPoint)
		{
			followPoint = true;
		}
		else
		{
			followPoint = false;
		}
	}
	
	if(typeof accSmallerThan !== "undefined") console.log("accsmnaller than !== undefined"); 
	if(typeof seqSmallerThan !== "undefined") console.log("seqSmallerThan than !== undefined"); 
	else console.log("seqSmallerThan  === undefined");
	
	console.log("followPoint: "+followPoint);
	console.log("animate: "+animate);
	console.log("stringify par: "+JSON.stringify(par));

	dbfunctions.selectRouteFromPoints(req.params.routeref, filter, function(tableRoute, route, gpsdets, networkdets, overallAggregate){
		//console.log('bbbbbbbbbbbbbbbbbbbbb: '+JSON.stringify(route));
		if(route.length == 0)
		{
			res.error('This route has no points!');
			res.redirect('/');
		}
		else
		{		
			var currLat, currLon;
			var prevLat = route[0].LATITUDE, prevLon = route[0].LONGITUDE;
			var currentDataDist = 0;
			var currentDataPointsAmount = route.length;
			
			/*for(i=0;i<route.length-1;i++){
				if(i%13.0!=0) route.splice(i,1);
			}*/
			
			route.forEach(function(element,index){
				//console.log(index);
				currLat = element.LATITUDE;
				currLon = element.LONGITUDE;
				//lat lon lat lon
				currentDataDist += distance(currLat, currLon, prevLat, prevLon);
				prevLat = currLat;
				prevLon = currLon;
				
			});
			var currentDataElapsedTimeSec = (route[route.length-1].ELAPSEDTIMENANOS - route[0].ELAPSEDTIMENANOS)/1000000000.0;
			var currentDataElapsedTimeMin = (route[route.length-1].ELAPSEDTIMENANOS - route[0].ELAPSEDTIMENANOS)/1000000000.0/60.0;
			currentDataDist = Math.round(currentDataDist * 100) / 100;
			currentDataElapsedTimeSec = Math.round(currentDataElapsedTimeSec);
			currentDataElapsedTimeMin = Math.round(currentDataElapsedTimeMin);
			console.log("\x1b[31m","DISTANCE: "+currentDataDist);

			res.render('routeDets', {
															 tableRoute: tableRoute, 
															 route: route, 
															 routeref: req.params.routeref, 
															 animate: animate, 
															 followPoint: followPoint,
															 accSmallerThan: accSmallerThan,
															 accGreaterThan: accGreaterThan,
															 provider: provider,
															 gpsdets: gpsdets,
															 networkdets: networkdets,
															 satsGreaterThan: satsGreaterThan,
															 satsSmallerThan: satsSmallerThan,
															 seqGreaterThan: seqGreaterThan,
															 seqSmallerThan: seqSmallerThan,
															 overallAggregate,
															 currentDataDist: currentDataDist,
															 currentDataElapsedTimeSec: currentDataElapsedTimeSec,
															 currentDataElapsedTimeMin: currentDataElapsedTimeMin,
															 currentDataPointsAmount: currentDataPointsAmount,
															 viewsCounter: viewsCounter,
															 sessUserRef: sessUserRef
															 });
		}
	});
	
};

exports.routeDetsFromPointsPost = function(req, res, next){
	var parameters = req.body.parameters;
	console.log("p[arameters stringify: "+JSON.stringify(parameters));
	
	next();
	
};

exports.searchRoute = function(req, res, next){
	console.log('search get');
	
	res.render('search');
};

exports.searchRoutePost = function(req, res, next){
	var parameters = req.body.parameters;
	console.log('search post');
	console.log("search parameters stringify: "+JSON.stringify(parameters));
	var filter = '';
	if(parameters)
	{
		if(parameters.title && parameters.title != '')
		{
			filter += 'and r.TITLE containing \''+parameters.title+'\' ';
		}
		else
		{
			
		}
		
		if(parameters.user && parameters.user != '')
		{
			filter += 'and u.LOGIN containing \''+parameters.user+'\' ';
		}
		else
		{
			
		}
		
		if(parameters.dataod && parameters.dataod != '' && parameters.dataod.length == 10)
		{
			console.log("TIMADD 10 znakow");
			filter += 'and r.TIMEADD >= \''+parameters.dataod+'\' ';
		}
		else
		{
			
		}
		
		if(parameters.datado && parameters.datado != '' && parameters.datado.length == 10)
		{
			console.log("TIMADD 10 znakow");
			filter += 'and r.TIMEADD >= \''+parameters.datado+'\' ';
		}
		else
		{
			
		}
	}
	console.log('filter w post: '+filter);
	dbfunctions.searchRoutes(filter, function(routes){
		var links = [];
		
		//console.log('search: routes.stringify: '+JSON.stringify(routes));
		
		routes.forEach(function(route){
			var link = '/route/'+route.REF;
			links.push({ link: link, title: route.TITLE, owner: route.LOGIN, timeadd: route.TIMEADD, ownerRef: route.OWNER, routeRef: route.REF });
		});
			
		console.log('links: '+JSON.stringify(links));
			
		res.locals.links = links;
		res.locals.routes = routes;
		res.locals.cardTitle = 'Searching results';
		res.render('searchResults');
	});
	
};

exports.editRoute = function(req, res, next){
	dbfunctions.selectRouteInfo(req.params.routeref, function(routeInfo){
		console.log(JSON.stringify(routeInfo));
		
		res.render('editRoute', {routeInfo: routeInfo});
	});
};

exports.editRoutePost = function(req, res, next){
	console.log('editRoutePost');
	var editRouteInfo = req.body.editRouteInfo;
	console.log(JSON.stringify(editRouteInfo));
	dbfunctions.updateRouteInfo(req.params.routeref, editRouteInfo.title, editRouteInfo.description, editRouteInfo.private, function(){
		res.info('Success! Route information changed.');
		next();
	});
};

exports.yourRoutes = function(req, res, next){
	
	var filter = 'and OWNER = '+req.session.userRef+' ';
	dbfunctions.searchRoutes(filter, function(routes){
		var links = [];
		
		routes.forEach(function(route){
			var link = '/route/'+route.REF;
			links.push({ link: link, title: route.TITLE, owner: route.LOGIN, timeadd: route.TIMEADD, ownerRef: route.OWNER, routeRef: route.REF });
		});
			
		console.log('links: '+JSON.stringify(links));	
		res.locals.links = links;
		res.locals.routes = routes;
		res.locals.cardTitle = 'Your routes';
		res.render('searchResults');
	});
};

exports.deleteRoute = function(req, res, next){
	var routeRef = req.body.routeRef;
	console.log('routeRef: '+routeRef);
	dbfunctions.deleteRouteByRef(routeRef, function(deletedRouteTitle){
		res.info('You have successfully deleted your route: '+deletedRouteTitle);
		next();
	});
	
};

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}




