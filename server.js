/*var https = require('https');
var fs = require('fs');
var key = fs.readFileSync('./key.pem');
var cert = fs.readFileSync('./cert.pem');
var https_options = {
    key: key,
    cert: cert
};*/

var mongoose = require('mongoose');
var config = require('./config');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
//var server = https.createServer(https_options, app);
var bodyParser = require('body-parser');

var port = config.web.port;
var host = config.web.host;
var mongooseHost = config.mongoose.host;
var mongoosePort = config.mongoose.port;
var mongooseDb = config.mongoose.db;

//cargo las funciones utiles: en global.utils.guid
require('./controllers/utils');

/*var Datastore = require('nedb')
  , usersDb = new Datastore({ filename: './database/users.db', autoload: true })
  , modulesDb = new Datastore({ filename: './database/modules.db', autoload: true })
  , rolesDb = new Datastore({ filename: './database/roles.db', autoload: true })
  , tprocessDb = new Datastore({ filename: './database/tprocess.db', autoload: true })
  , tablesDb = new Datastore({ filename: './database/tables.db', autoload: true })
  , processDb = new Datastore({ filename: './database/process.db', autoload: true });
*/
app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());


// inicio las tableContentDb: [{tableId, table, dataStore}] arreglo con los ids, nombres de las tables y los dataStores
/*var tableContentDb = [];
var refreshTableContentDb = function() {
	tableContentDb = [];
	tablesDb.find({}, function(error, tables) {
		if (error) console.log("Error refrescando tableContentDb: " + error);
		else {
			for (var i = 0; i < tables.length; i++) {
				var f = './database/content/' + tables[i]._id + '.db';
				var dt = new Datastore({ filename: f, autoload: true });

				tableContentDb.push({tableId: tables[i]._id, table: tables[i].name, dataStore: dt});
			}
		}
	});
}
var tableContentDbDatastore = function(table) {
	var found = -1;
	for(var i = 0; i < tableContentDb.length; i++) {
		if (tableContentDb[i].formId === table) {
			found = i;

			break;
		}
	}

	if (found !== -1) return tableContentDb[found].dataStore;
	else return null;
}
*/
// inicio las tablas que tienen contenido
//refreshTableContentDb();

//controllers
var datastageController = require('./controllers/datastage');
var datatableController = require('./controllers/datatable');
var fieldsController = require('./controllers/fields');
var fieldStageController = require('./controllers/fieldstages');
var modulesController = require('./controllers/modules');
var processController = require('./controllers/process');
var rolesController = require('./controllers/roles');
var stageController = require('./controllers/stage');
var tablesController = require('./controllers/tables');
var tprocessController = require('./controllers/tprocess');
var usersController = require('./controllers/users');

datastageController(app);
datatableController(app);
fieldsController(app);
fieldStageController(app);
modulesController(app);
processController(app);
rolesController(app);
stageController(app);
tablesController(app);
tprocessController(app);
usersController(app);

mongoose.connect(`mongodb://${mongooseHost}:${mongoosePort}/${mongooseDb}`, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', () => {console.log( '---NO CONECTADO a mongoose')});
db.once('open', () => {
 console.log( '+++CONECTADO a mongoose');
});


app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(port, host, function() {
	console.log(`Servidor corriendo en http://${host}:${port}`);
});
