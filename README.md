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

Example
----------

```js
var router = require('tiny-router');

var lights = { light1: 0, light2: 0};

router
    .get('/', function(req, res) {
        res.send('Welcome to tiny-router, a library for embed systems');
    })
    .get('/lights', function(req, res){
        res.send(lights);
    })
    .get('/light1', function(req, res){
        res.send({status: lights.light1});
    })
    .get('/light1/{status}', function(req, res){
        lights.light1 = parseInt(req.body.status);
        res.send({status: lights.light1});
    });


router.listen(8080);
```

Methods
----------
 - use: Allow to overwrite default values configurations: ('static', 'defaultPage') and default methods: ('readFile', 'fileExist') this is useful when different embedded system read the file system differently.
 - Router: Return the routing table created from the get, post, put, etc.. methods
 - listen(port): Return a instance of http.createServer(router.Router()).listen(port)
 - addMethod(method): Allow the extension of supported method from the supported list: (GET, POST, PUT DELETE)
 - addMimeType({ext: '.mp4', mime: 'video/mp4'}): It extends the mime types supported by the server. It can use a third party mime type detector by overwriting the getMime method


Version
----

0.0.5



License
----

MIT


**Free Software, Hell Yeah!**