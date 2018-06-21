var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Firebird = require('node-firebird');
var session = require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');
var routes = require('./routes/routes');
var register = require('./routes/register');
var login = require('./routes/login');
var locations = require('./routes/locations');
//lib
var messages = require('./lib/messages');
var user_mid = require('./lib/user_mid');
var letOnlyLogged = require('./lib/letOnlyLogged');
var letOnlyGuests = require('./lib/letOnlyGuests');
var checkPrivacyLetOnlyOwner = require('./lib/checkPrivacyLetOnlyOwner');
var letOnlyOwnerEditRoute = require('./lib/letOnlyOwnerEditRoute');

//lib
var test = require('./routes/test');
var rest = require('./routes/rest');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret: 'hashuje sesje0129348091238409d',
	saveUninitialized: true,
	resave: true
}));
app.use(messages); //przepisywanie messages z sesji do res.locals
app.use(user_mid);

//16.05.2018
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// ---- REST ----
app.post('/rest/insertRoute', rest.RESTInsertRoute);
app.post('/rest/insertChunk', rest.RESTInsertChunk_2);
app.post('/rest/insertLocation', rest.RESTInsertLocation);
app.post('/rest/login', rest.RESTLogin)
// ---- REST ----

//app.get('/route/:routeref', letOnlyLogged, routes.routeDets);
app.get('/route/:routeref', checkPrivacyLetOnlyOwner, routes.routeDetsFromPoints);
app.post('/route/:routeref', checkPrivacyLetOnlyOwner, routes.routeDetsFromPointsPost, routes.routeDetsFromPoints);
app.post('/deleteRoute', letOnlyLogged, routes.deleteRoute, routes.yourRoutes);
app.get('/editRoute/:routeref', letOnlyLogged, letOnlyOwnerEditRoute, routes.editRoute);
app.post('/editRoute/:routeref', letOnlyLogged, letOnlyOwnerEditRoute, routes.editRoutePost, routes.editRoute);
app.get('/search', routes.searchRoute); //letOnlyLogged
app.post('/search', routes.searchRoutePost);//letOnlyLogged
app.get('/register', letOnlyGuests, register.sendForm);
app.post('/register', register.submitForm);
app.get('/login', letOnlyGuests, login.sendForm);
app.post('/login', login.submitForm);
app.get('/logout', letOnlyLogged, login.logout);
app.get('/', index.index);
app.get('/download', function(req, res){
  var file = __dirname + '/public/apk/app-debug.apk';
  res.download(file); // Set disposition and send it.
});
app.get('/editAccount', letOnlyLogged, users.editAccount);
app.post('/editAccount', letOnlyLogged, users.editAccountPost, users.editAccount);
app.get('/yourRoutes', letOnlyLogged, routes.yourRoutes);
app.get('/yourLocations', letOnlyLogged, locations.yourLocations);
app.post('/yourLocations', letOnlyLogged, locations.deleteLocation, locations.yourLocations); //na POST usuwanie lokacji
app.get('/location/:locationref', locations.location);
app.get('/generalDets', index.generalDets);

//GOOGLE
app.get('/google1e22ecf28270644d.html', index.googlowe);

// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
