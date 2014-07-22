tiny-router
=========

A simple routing library targeting embedded system where every byte counts. Right now there are few embedded systems running Javascript: Tessel, BeagleBone, RaspberryPi, and Espruino.

  - Currently testing on Tessel, Espruino, BeagleBone, and Raspberry Pi

Installation
-----------

```js
npm install tiny-router
```
 
Features
--------

 - Simple routing
 - Supports GET, POST, PUT, DELETE. It can be extended by using the methodAdd fn
 - Retrieving submitted data from the req.body object
 - Light weight, only 160 lines of code to get an express like experience

##Examples:
----------

###Tessel lights
```js
var router = require('tiny-router'),
    tessel = require('tessel');

var lights = { 
    green: tessel.led[0], 
    blue: tessel.led[1], 
    red: tessel.led[2]
    amber: tessel.led[3]
};

router
    .get('/', function(req, res) {
        res.send('Simple light web API');
    })
    .get('/lights', function(req, res){
        res.send(lights);
    })
    .get('/green', function(req, res){
        var state = lights.green.read();
        lights.green.write(state);
        res.send({status: state});
    })
    .get('/green/{state}', function(req, res){
        var state = parseInt(req.body.state);
        lights.green.write(state);
        res.send({status: state});
    });

router.listen(8080);
```

###Raspberry Pi 

```js
    coming soon
```

###BeagleBone 

```js
    coming soon
```

Methods
----------
**use:** Allow to overwrite default values configurations: ('static', 'defaultPage') and default methods: ('readFile', 'fileExist') this is useful when different embedded system read the file system differently.
```js
  router.use('defaultPage', 'default.html');
```
**Router:** Return the routing table created from the get, post, put, etc.. methods
```js
    http.createServer(router.Router()).listen(3000);
```
**listen(port):** Return a instance of http.createServer(router.Router()).listen(port)
```js
    router.listen(3000);
```
**addMethod(method):** Allow the extension of supported method from the supported list: (GET, POST, PUT DELETE)

```js
    router.addMethod('TRACE');
    router.trace('/logs', function(req, res){
        res.send('this are traces');
    });
```
**addMimeType(mimeObject):** It extends the mime types supported by the server. It can use a third party mime type detector by overwriting the getMime method
```js
    router.addMimeType({ext:'.mp4', mime:'video/mp4'});
```


Version
----

0.0.6



License
----

MIT


**Free Software, Hell Yeah!**
