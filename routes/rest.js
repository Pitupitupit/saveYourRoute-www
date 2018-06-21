var express = require('express');
var dbfunctions = require('../db/dbfunctions');
var User = require('../models/user');

exports.RESTInsertRoute = function(req, res, next) {
	
	//var title = req.body;
	console.log('REST insertRoute start');
	//console.log(title);
	//console.log(title.title);
	console.log(req.body);
	var priv;
	if(req.body.priv == 'false')
		priv = 0;
	else
		priv = 1;
	//console.log(req.body.title);
	dbfunctions.insertRoute(req.body.title, parseInt(req.body.userRef), req.body.description, priv, function(routeref){
		//console.log(req.body.title);
		//es.render('index', {title: routeref});
		res.status(200).send({routeref: routeref});
	});
};

exports.RESTInsertChunk = function(req, res, next) {
	console.log('REST insertChunk start');
  console.log(req.body.routeref);
	console.log(req.body.sequence);
	console.log(req.body.coords);

	
	
	dbfunctions.insertChunk(req.body.routeref, req.body.coords, req.body.sequence, function(routeref){
		res.status(200).send('pszyjento');
	});
};

exports.RESTInsertChunk_2 = function(req, res, next) {
	console.log('REST insertChunk_2 start');
	console.log(req.body.routeref);
	console.log(req.body.sequence);
	console.log(req.body.coords);
	
	var points = JSON.parse(req.body.coords);
	console.log(points.lats[0]);



		var pointArr = [];

		pointArr.push ( points.longs[0] );
		pointArr.push ( points.lats[0] );
		pointArr.push ( points.alts[0] );
		pointArr.push ( points.sats[0] );
		pointArr.push ( points.acc[0] );
		pointArr.push ( points.distb[0] );
		pointArr.push ( points.prov[0] );
		pointArr.push ( points.ertn[0] );
		pointArr.push ( points.bear[0] );
		pointArr.push ( points.bearto[0] );
		pointArr.push ( points.speed[0] );
		pointArr.push ( points.pointSequence[0] );
		pointArr.push ( req.body.routeref );

		dbfunctions.insertPoint(pointArr, function(){

			pointArr = [];

			pointArr.push ( points.longs[1] );
			pointArr.push ( points.lats[1] );
			pointArr.push ( points.alts[1] );
			pointArr.push ( points.sats[1] );
			pointArr.push ( points.acc[1] );
			pointArr.push ( points.distb[1] );
			pointArr.push ( points.prov[1] );
			pointArr.push ( points.ertn[1] );
			pointArr.push ( points.bear[1] );
			pointArr.push ( points.bearto[1] );
			pointArr.push ( points.speed[1] );
			pointArr.push ( points.pointSequence[1] );
			pointArr.push ( req.body.routeref );

			dbfunctions.insertPoint(pointArr, function(){
				
				pointArr = [];
				
				pointArr.push ( points.longs[2] );
				pointArr.push ( points.lats[2] );
				pointArr.push ( points.alts[2] );
				pointArr.push ( points.sats[2] );
				pointArr.push ( points.acc[2] );
				pointArr.push ( points.distb[2] );
				pointArr.push ( points.prov[2] );
				pointArr.push ( points.ertn[2] );
				pointArr.push ( points.bear[2] );
				pointArr.push ( points.bearto[2] );
				pointArr.push ( points.speed[2] );
				pointArr.push ( points.pointSequence[2] );		
				pointArr.push ( req.body.routeref );
				
				dbfunctions.insertPoint(pointArr, function(){
					
					res.status(200).send('OKEJ');
					
				});
				
			});
			
		});
	
	
/*	var x = 0;
var loopArray = function(arr) {
    customAlert(points[x],function(){
        // set x to next item
        x++;

        // any more items in array? continue loop
        if(x < 3) {
            loopArray(arr);   
        }
    }); 
}

function customAlert(points,callback) {    
		//var point;
		var pointArr = [];

		
		pointArr.push ( points.longs );
		pointArr.push ( points.lats );
		pointArr.push ( points.alts );
		pointArr.push ( points.sats );
		pointArr.push ( points.acc );
		pointArr.push ( points.distb );
		pointArr.push ( points.prov );
		pointArr.push ( points.ertn );
		pointArr.push ( points.bear );
		pointArr.push ( points.bearto );
		pointArr.push ( points.speed );
		pointArr.push ( points.pointSequence );		
		pointArr.push ( req.body.routeref );
		

		dbfunctions.insertPoint(pointArr, function(){
			callback();
		});

    
}
	
	
loopArray(points);*/


	
	
	
	
	
	
	
	
	
	
	//for(i=0; i<points.lats.length; i++)
	//{
	//	console.log(i);
		//var point;
	//	var pointArr = [];

		
		/*pointArr.push ( points.longs[i] );
		pointArr.push ( points.lats[i] );
		pointArr.push ( points.alts[i] );
		pointArr.push ( points.sats[i] );
		pointArr.push ( points.acc[i] );
		pointArr.push ( points.distb[i] );
		pointArr.push ( points.prov[i] );
		pointArr.push ( points.ertn[i] );
		pointArr.push ( points.bear[i] );
		pointArr.push ( points.bearto[i] );
		pointArr.push ( points.speed[i] );
		pointArr.push ( points.pointSequence[i] );		
		pointArr.push ( req.body.routeref );
		

		dbfunctions.insertPoint(pointArr);
		
	}*/
	
	
	//res.status(200).send('OKEJ');
};








exports.RESTInsertLocation = function(req, res, next) {
	
	console.log('REST insertLocation start');
	console.log(req.body);
	console.log('REST insertLocation start');
	console.log(req.body.name);
	console.log(''+parseInt(req.body.userRef));
	console.log(''+parseFloat(req.body.latitude));
	console.log(''+parseFloat(req.body.longitude));
	dbfunctions.insertLocation(req.body.name, parseInt(req.body.userRef), parseFloat(req.body.latitude), parseFloat(req.body.longitude), function(locationref){
		var link = 'http://saveyourroute.mooo.com/location/'+locationref;
		console.log(link);
		res.status(200).send({link: link});
	});
};

/*exports.RESTInsertChunk = function(req, res, next) {
	console.log('REST insertChunk start');
  console.log(req.body.routeref);
	console.log(req.body.sequence);
	console.log(req.body.coords);
	
	dbfunctions.insertChunk(req.body.routeref, req.body.coords, req.body.sequence, function(routeref){
		res.status(200).send('pszyjento');
	});
};*/

exports.RESTLogin = function(req, res, next) {
	console.log('???');
	console.log('REST req body stringify: '+JSON.stringify(req.body));
	//console.log('REST req  stringify: '+JSON.stringify(req));
	console.log('???');
	console.log('REST submitForm: login: '+req.body.login);
	console.log('???');
	console.log('REST submitForm: pass: '+req.body.password);
	User.auth(req.body.login, req.body.password, function(err, user){
		if(err) 
		{
			console.log("err err err");
			res.status(401).send({ status: 401, msg: 'BAD CREDENTIALS' });
		}
		
		if(user){
			console.log('REST submitForm: user.stringify: '+JSON.stringify(user));
			req.session.userRef = user.REF;
			res.status(200).send({ userRef: user.REF, login: user.LOGIN });
		}
		else {
			console.log("ELSELSELSE EELLSSEE");
			res.status(401).send({ status: 401, msg: 'BAD CREDENTIALS' });
		}
	});
}
