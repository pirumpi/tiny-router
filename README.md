tiny-router
=========

A simple routering library targeting embed system where every byte counts. Right now there are two microcontrollers running Javascript: Tessel, and Espruino.

  - Currently testing on Tessel

Installation
-----------

```js
npm install tiny-router
```
 
Features
--------

 - Simple routing
 - Supports GET, POST, PUT, DELETE
 - Retreiving data from the req.body object

Example
----------

```js
var http = require('http'),
    router = require('tiny-router');
    
router.get('/', function(req, res){
    res.end('Hello World');
});

router.get('/light', function(req, res){
    res.end('Displaying the state of all my lights');
});

router.get('/light/{lightState}', function(req, res){
    res.end('LightState: ' + req.body.lightState);
});

http.createServer(router.Router()).listen(8080);
```

Version
----

0.0.4



License
----

MIT


**Free Software, Hell Yeah!**