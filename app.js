var express = require('express'),
    mongodb = require('mongodb');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

var mongoClient = new mongodb.Db('junostips', new mongodb.Server("127.0.0.1", 27017, {}), {native_parser:false});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  mongoClient.open(function(err,db) {
    db.collection('junostips', function(err, collection) {
      collection.find(function(err, cursor) { 
        cursor.nextObject(function(err,doc) {
          res.render('main', { title: 'MyJunos', junostip: doc.tipText});
        });
      });
    });
  });
});

app.listen(3000);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
