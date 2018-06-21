var Firebird = require('node-firebird');

var options = {};
options.host = 'localhost';
options.port = 3050;
//options.database = '/home/piotrek/Desktop/inz.fdb';
options.database = '/home/pi/baza_inz/rasp2.fdb';
options.user = 'SYSDBA';
//options.password = 'kustosz';
options.password = 'masterkey';

exports.insertRoute = function(title, owner, description, priv, callback){
	Firebird.attach(options, function(err, db) {
		if (err) throw err;
		console.log("REST OWNER: "+owner);
		var sql = 'insert into ROUTE(TITLE, OWNER, DESCRIPTION, PRIVATE) values(?, ?, ?, ?)';
		db.query(sql,[title, owner, description, priv], function(err, result) {
			if (err) throw err;
			db.query('SELECT REF from ROUTE where title = ? and owner = ? and description = ? and private = ? order by REF desc', [title,owner,description,priv],function(err,resu){

				console.log(resu[0].REF);
				callback(resu[0].REF);
			});
		});
		db.detach();
	});
}

exports.insertChunk = function(routeref,coords,sequence,callback){
	Firebird.attach(options, function(err, db) {
		if (err) throw err;

		var sql = 'insert into CHUNK(ROUTE, TIMEADD, COORDS, SEQUENCE) values(?,current_timestamp,?,?)';
		console.log('routeref: '+routeref + 'coords: '+coords+ 'sequence: '+sequence);
		console.log(sql);
		db.query(sql,[routeref,coords,sequence], function(err, result) {
			if (err) throw err;
			callback();
		});
		db.detach();
	});
}

exports.insertPoint = function(pointArr, callback){
	Firebird.attach(options, function(err, db){
		if(err) throw err;

		console.log('DB REST insert point');

		var sql = 'insert into POINT(LONGITUDE, LATITUDE, ALTITUDE, SATELLITES, ACCURACY, DISTANCEBETWEEN, PROVIDER, ELAPSEDTIMENANOS, BEARING, BEARTO, SPEED, SEQ, ROUTE, TIMEADD) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,current_timestamp)';

		db.query(sql, pointArr, function(err,result) {
			if(err) throw err;
			db.detach();//testowo tu
			callback();
		});
//		db.detach();
	});
}




exports.selectRoute = function(routeref,callback){
	Firebird.attach(options, function(err, db) {
		if(err) throw err;
		var resultFromQuery;
		var coords;

		var sql = 'select COORDS from CHUNK where ROUTE = ? order by TIMEADD desc';
		db.query(sql, [routeref], function(err,result) {
			if(err) throw err;
			console.log(sql);

			result.forEach(function(el, index){
				result[index] = JSON.parse(el.COORDS);
				result[index].lats.forEach(function (e,i){
					result[index].lats[i] = parseFloat(e);
				});
				result[index].longs.forEach(function (e,i){
					result[index].longs[i] = parseFloat(e);
				});
			});
			coords = result;
			

			sql = 'select first 1 TITLE from ROUTE where REF = ?'
			db.query(sql, [routeref], function(err,result) {
				if(err) throw err;
				console.log(sql);
				console.log('db: result.TITLE: '+result[0].TITLE);
				//console.log('db: result.stringify: '+JSON.stringify(result));
				callback(result[0].TITLE,coords);

			});

		});
		db.detach();
	});
}

exports.selectRouteFromPoints = function(routeref, filter, callback){
	Firebird.attach(options, function(err, db) {
		if(err) throw err;
		var points;
		var title;
		var gpsdets;
		var networkdets;
		var tableRoute;
		var overallAggregate;

		var sql = 'select REF,LONGITUDE,LATITUDE,ALTITUDE,SATELLITES,ACCURACY,DISTANCEBETWEEN,PROVIDER,ELAPSEDTIMENANOS,BEARING,BEARTO,SPEED,SEQ,ROUTE,TIMEADD from POINT where ROUTE = ? '+filter+ ' and latitude is not null order by ELAPSEDTIMENANOS asc';
		console.log('\x1b[36m%s\x1b[0m',sql);
		db.query(sql, [routeref], function(err,result) {
			if(err) throw err;
			//console.log('\033[2J');
			console.log("CO TO X OTOTO: "+result.length);
			//console.log('\x1b[36m%s\x1b[0m','result stringify: '+JSON.stringify(result));
			points = result;
		
			sql = 'select r.REF, r.TITLE, r.OWNER, r.DESCRIPTION, r.PRIVATE, u.LOGIN from ROUTE r left join USERS u on (r.OWNER = u.REF) where r.REF = ?'
			db.query(sql, [routeref], function(err,result) {
				if(err) throw err;
				title = result[0].TITLE;
				tableRoute = result[0];
				console.log(sql);
				console.log('db: result.TITLE: '+result[0].TITLE);
				//console.log('db: result.stringify: '+JSON.stringify(result));
				
				sql = 'select round(sum(p.ACCURACY)/count(p.REF),2) as gpsavgacc, count(p.REF) as gpscount, max(p.SATELLITES) as gpsmaxsats , min(p.SATELLITES) as gpsminsats, max(p.ACCURACY) as gpsmaxacc,  min(p.ACCURACY) as gpsminacc from point p where p.route = ? and p.provider = ?';
				db.query(sql, [routeref, 'gps'], function(err, result) {
					if(err) throw err;
					gpsdets = result[0];
					
					sql = 'select round(sum(p.ACCURACY)/count(p.REF),2) as NETWORKAVGACC, count(p.ref) as networkcount, round(max(p.ACCURACY),2) as networkmaxacc,  round(min(p.ACCURACY),2) as networkminacc from point p where p.route = ? and p.provider = ?';
					db.query(sql, [routeref, 'network'], function(err, result) {
						if(err) throw err;
						networkdets = result[0];
					
						sql = 'select '+
										 'cast(max(p.timeadd) as date) ||\' \'|| substring(cast(max(p.timeadd) as time) from 1 for 8) as overallmaxdata, '+
										 'cast(min(r.TIMEADD) as date) ||\' \'||  substring(cast(min(r.timeadd) as time) from 1 for 8) as overallmindata, '+
										 'datediff(minute  from  min(r.timeadd) to max(p.timeadd)) as minuty, '+
										 'datediff(second  from  min(r.timeadd) to max(p.timeadd)) as sekundy, '+
										 'count(p.ref) as countPoints '+
									 'from point p '+
									   'join route r on (r.ref = p.route) '+
									 'where p.route = ?';
						db.query(sql, [routeref], function(err, result) {
							if(err) throw err;
							overallAggregate = result[0];
							callback(tableRoute, points, gpsdets, networkdets, overallAggregate);
						});
						
					  
					});
				});
				
				//callback(result[0].TITLE, points);

			});

		});
		db.detach();
	});
}

function isString (value) {
	return typeof value === 'string' || value instanceof String;
};
function removeAp(objin) {
	console.log('---');
	console.log('removeAp');
	console.log('---');
	console.log(typeof objin);
	console.log('---');
	console.log(objin);
	console.log('---');
	console.log(JSON.stringify(objin));
	console.log('---');
	console.log(JSON.stringify(objin).replace(/"/g, "").replace(/\\/g, ""));
	console.log('---');

	/*objin.forEach(function(el){
			el.COORDS = JSON.parse(el.COORDS);
			el.lats.forEach(function (e){
				e = parseFloat(e);
			});
			el.lats.longs.forEach(function (e){
				e = parseFloat(e);
			});
			console.log(el.COORDS);
	});*/
	objin = objin.replace("\"", "");
}

exports.insertUser = function(user, callback){
	Firebird.attach(options, function(err, db) {
		if (err) throw err;

		var sql = 'insert into USERS(LOGIN, PASS, SALT, TIMEADD) values(?,?,?,current_timestamp)';
		db.query(sql,[user.login, user.pass, user.salt], function(err, result) {

			if (err) return callback(err);
			db.query('SELECT REF FROM USERS WHERE login = ? and pass = ? and salt = ?',[user.login, user.pass, user.salt], function(err,resu){

				callback(null, resu[0].REF);
			});
		});
		db.detach();
	});
}

/*exports.selectUserRefByLogin = function(login, callback){
	Firebird.attach(options, function(err, db) {
		if (err) throw err;

		var sql = 'select REF from USERS where LOGIN = ?';
		db.query(sql,[login], function(err, result) {
			if(err) throw err;
			callback(result.REF);
		});
		db.detach();
	});
}*/

exports.selectUserByRef = function (ref, callback){
	Firebird.attach(options, function(err, db){
		if(err) throw err;
		
		var sql = 'select REF, LOGIN, PASS, SALT, TIMEADD from USERS where REF = ?';
		db.query(sql, [ref], function(err,result){
				if(err) callback(err);
				callback(null, result);
		});
		db.detach();
	});
}

exports.updateUser = function (user, callback){
	Firebird.attach(options, function(err, db){
		if(err) throw err;
		
		var sql = 'update USERS set LOGIN = ?, PASS = ? where REF = ?';
		db.query(sql, [user.login, user.pass, user.ref], function(err,result){
			if(err) throw err;
			callback();
		});
		db.detach();
	});
	
}

exports.selectUserByLogin = function(login, callback){
	console.log('dbfunction.js selectUserByLogin co ja robię tuuu');
	Firebird.attach(options, function(err, db) {
		if (err) throw err;

		var sql = 'select REF, LOGIN, PASS, SALT, TIMEADD from USERS where LOGIN = ?';
		db.query(sql,[login], function(err, result) {
			console.log('selectUserByLogin result.stringify: '+JSON.stringify(result));
			if(err) callback (err);
			callback(null, result);
		});
		db.detach();
	});
}

exports.selectAllRoutes = function(callback){
	Firebird.attach(options, function(err, db) {
		if(err) throw err;
		
		var sql = 'select r.REF, r.TITLE, u.LOGIN from ROUTE r '+
								'join USERS u on (r.OWNER = u.REF) '+
								'where r.OWNER is not null';
		db.query(sql, function(err, result){
			if(err) callback(err);
			callback(null, result);
		});
		db.detach();
	});	
}

exports.updateViewCounterReturnCounter = function(routeref, callback){
	Firebird.attach(options, function(err, db) {
		if(err) throw err;
		console.log('routeref: '+routeref);
		var sql = 'update route set viewscounter = iif(viewscounter is not null, (viewscounter+1), 1)  where ref = ?';
		console.log(sql);
		db.query(sql, [routeref], function(err, result){
			if(err) throw err;
			
			db.query('SELECT VIEWSCOUNTER FROM ROUTE WHERE REF = ?', [routeref], function(err,resu){
				if(err) throw err;
				console.log("VIEWSCOUNTER:"+resu[0].VIEWSCOUNTER);
				callback(resu[0].VIEWSCOUNTER);

			});
		});
		db.detach();
	});
}

exports.selectPrivateAndOwnerFromRoute = function(routeref, callback){
	Firebird.attach(options, function(err, db) {
		if(err) throw err;
		
		var sql = 'select PRIVATE, OWNER from ROUTE where REF = ?';
		console.log(sql);
		db.query(sql, [routeref], function(err, result){
			if(err) throw err;
			console.log("aaaaaaaaaaaaaaaaaaaaaa: "+JSON.stringify(result)+result.length);
			if(result.length == 0) 
				callback(0, null, null);
			else
				callback(null, result[0].PRIVATE, result[0].OWNER);
		});
		db.detach();
	});
}

exports.selectRouteInfo = function(routeref, callback){
	Firebird.attach(options, function(err, db) {
		if(err) throw err;
		
		var sql = 'select REF, TITLE, DESCRIPTION, TIMEADD, PRIVATE, OWNER, VIEWSCOUNTER from ROUTE where REF = ?';
		console.log(sql);
		db.query(sql, [routeref], function(err, result){
			if(err) throw err;
			callback(result[0]);
		});
		db.detach();
	});
}

exports.updateRouteInfo = function(routeref, title, description, priv, callback){
	Firebird.attach(options, function(err, db) {
		if(err) throw err;
		console.log("90909090");
		console.log(routeref);
		console.log(title);
		console.log(description);
		console.log(priv);
		var sql = 'update ROUTE set TITLE = ?, DESCRIPTION = ?, PRIVATE = ? where REF = ?';
		console.log(sql);
		db.query(sql, [title, description, priv, routeref], function(err, result){
			if(err) throw err;
			callback();
		});
		db.detach();
	});
}

exports.searchRoutes = function(filter, callback){
	Firebird.attach(options, function(err, db) {
		if(err) throw err;
		
		var sql = 'select r.REF, r.TITLE, r.DESCRIPTION, r.TIMEADD, r.PRIVATE, r.OWNER, r.VIEWSCOUNTER, u.LOGIN from ROUTE r join USERS u on (r.OWNER = u.REF) where 1=1 '+filter+' order by r.TIMEADD desc';
		console.log(sql);
		db.query(sql, function(err, result){
			if(err) throw err;
			callback(result);
		});
		db.detach();
	});
}

exports.yourLocations = function(ownerRef, callback){
	Firebird.attach(options, function(err, db) {
		if(err) throw err;
		
		var sql = 'select l.REF, l.NAME, l.LATITUDE, l.LONGITUDE, l.OWNER, l.TIMEADD from LOCATIONS l where l.OWNER = ? order by l.TIMEADD desc';
		console.log(sql);
		db.query(sql, [ownerRef], function(err, result){
			if(err) throw err;
			callback(result);
		});
		db.detach();
	});
}

exports.selectLocationByRef = function(locationRef, callback){
	Firebird.attach(options, function(err, db) {
		if(err) throw err;
		
		var sql = 'select l.REF, l.NAME, l.LATITUDE, l.LONGITUDE, l.OWNER, l.TIMEADD from LOCATIONS l where l.REF = ?';
		console.log(sql);
		db.query(sql, [locationRef], function(err, result){
			if(err) throw err;
			callback(result[0]);
		});
		db.detach();
	});
}

exports.insertLocation = function(nam, owne, la, lo, callback){

	Firebird.attach(options, function(err, db) {
		if (err) throw err;
		console.log("REST OWNER: "+owne);
		var sql = 'insert into LOCATIONS(NAME, OWNER, LATITUDE, LONGITUDE) values(?,?,?,?)';
		console.log(sql);
		db.query(sql,[nam, owne, la, lo], function(err, result) {
			if (err) throw err;
			db.query('SELECT REF from LOCATIONS where name = ? and owner = ? and latitude = ? and longitude = ? order by REF desc',[nam, owne, la, lo], function(err,resu){

				console.log(resu[0].REF);
				callback(resu[0].REF);
			});
		});
		db.detach();
	});
}

exports.deleteLocationByRef = function(locationRef, callback){
	Firebird.attach(options, function(err, db) {
		var name;
		console.log('LOCATIONREF:'+locationRef);
		if (err) throw err;
		db.query('select NAME from locations where REF = ?',[locationRef],function(err,resu){
			console.log('RESU.NAME='+resu[0].NAME);
			name = resu.NAME;
			var sql = 'delete from LOCATIONS where REF = ?';
			console.log(sql);
			db.query(sql,[locationRef], function(err, result) {
				if (err) throw err;
				console.log('RESU.NAME=',resu.NAME);
				console.log('NAME:'+NAME);
				callback(name);
			});
		});
		db.detach();
	});
}

exports.deleteRouteByRef = function(routeRef, callback){
	Firebird.attach(options, function(err, db) {
		if (err) throw err;
		db.query('select TITLE from route where REF = ?',[routeRef],function(err,resu){

			var sql = 'delete from ROUTE where REF = ?';
			console.log(sql);
			db.query(sql,[routeRef], function(err, result) {
				if (err) throw err;
				callback(resu[0].TITLE);
			});
		});
		db.detach();
	});
}

exports.selectGeneral = function(callback){
	Firebird.attach(options, function(err, db) {
		if(err) throw err;
		
		var sql = 'select first 1 USERS, ROUTES, ROUTESPOINTS, LOCATIONS, DISTANCE, DATEOF from GENERAL where REF = 1';
		console.log(sql);
		db.query(sql, function(err, result){
			console.log('general: '+JSON.stringify(result));
			if(err) throw err;
			callback(result[0]);
		});
		db.detach();
	});
}

exports.selectGeneralDets = function(callback){
	Firebird.attach(options, function(err, db) {
		if(err) throw err;
		
		var sql = 'select USERS, ROUTES, ROUTESPOINTS, LOCATIONS, DISTANCE, substring(DATEOF from 1 for 10) DATEOF from GENERAL where REF != 1 and DATEOF <= current_date';
		console.log(sql);
		db.query(sql, function(err, result){
			console.log('general: '+JSON.stringify(result));
			if(err) throw err;
			callback(result);
		});
		db.detach();
	});
}
