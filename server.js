// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
var http 			 = require('http');
var fs 		     = require('fs');
var weather 	 = require('./node_modules/weather/weather.js');
var path       = require('path');
var cheerio 	 = require('cheerio');
var request 	 = require("request");
var cache			 = require('apicache').options({ debug: true }).middleware;

// configure app
app.use(morgan('dev')); // log requests to the console
app.use('/api/public', express.static(path.join(__dirname + '/public')));
var port     = process.env.PORT || 8090; // set our port



// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	//console.log('Something is happening.');
	res.setHeader('content-type', 'text/html');
	next();

});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {


});

// ----------------------------------------------------
router.route('/position/:lat/:lon',cache('30 minutes'))

	.get(function(req,res){
			apikey = '6752116556ac08cf87608b309c6fbb37';
			Latitud = req.params.lat;
			Longitud = req.params.lon;
			url = 'http://api.openweathermap.org/data/2.5/weather?lat='+Latitud+'&lon='+Longitud+'&units=metric&lang=es&appid='+apikey+'';

request({
	          url: url,
	          json: true
	      }, function (error, response, body) {
	          if (!error && response.statusCode === 200) {
	          console.log(body); // Print the json response
	        	res.setHeader('content-type', 'application/json');
						res.end(JSON.stringify(body));
	          }
	          console.log(error);
	      })


});


router.route('/meteo/:nombre')

	// get the city weather by name.
	.get(function(req, res) {
		//res.json({ message: 'Informe meteologico: ' + req.params.nombre});


		if (weather.city(req.params.nombre) != ''){
			  options= weather.city(req.params.nombre);
				console.log(options);


				var callback = function(response) {
				    var str = '';
				    response.setEncoding('utf8');

				    //another chunk of data has been recieved, so append it to `str`
				    response.on('data', function (chunk) {
				      str += chunk;
				    });

				    //the whole response has been recieved, so we just print it out here
				    response.on('end', function () {

				      fs.writeFile("/tmp/test", str,function(err) {
				          if(err) {
				              return console.log(err);
				          }

				          console.log("The file was saved!");

				          fs.readFile('/tmp/test', 'utf8', function(err, data) {

				              if( err ){
				                  console.log(err)
				              }
				              else{
												  request = 	weather.detail(data);
				                  }
													//

													console.log(request);
												  res.setHeader('content-type', 'text/html');
													res.end(JSON.stringify(request));


				          });
				      });
				    });
				  }
				http.request(options, callback).end();
		} else {
			res.setHeader('content-type', 'text/html');
			res.end(JSON.stringify('NO EXISTE'));
		}
})




// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Api is running on port ' + port);
