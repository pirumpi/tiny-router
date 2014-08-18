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

 Methods
 ----------
  - **use:** Allow to overwrite default values configurations: ('static', 'defaultPage') and default methods: ('readFile', 'fileExist') this is useful when different embedded system read the file system differently. Also it gives access to the request and response object before the routing tables are created.
     ```js
         //Changing defaultPage
         router.use('defaultPage', 'default.html');
     ```

     ```js
         //Setting a public folder
         router.use('static', {path: __dirname + '/public'});
     ```
     
     ```js
        //Creating a URL logger
        router.use(function(req, res, next){
            console.log('URL: ', req.url);
            next();
        });
     ```
  - **Router:** Return the routing table created from the get, post, put, etc.. methods
  
     ```js
         //Setting Routing table
         http.createServer(router.Router()).listen(3000);
     ```
  - **listen(port):** Return a instance of http.createServer(router.Router()).listen(port)
  
     ```js
         //A simple way to create server
         router.listen(3000);
     ```
  - **addMethod(method):** Allow the extension of supported method from the supported list: (GET, POST, PUT DELETE)
  
     ```js
         router.addMethod('TRACE');

         router.trace('/logs', function(req, res){
             res.send('this are traces');
         });
     ```
  - **addMimeType(mimeObject):** It extends the mime types supported by the server. It can use a third party mime type detector by overwriting the getMime method
     ```js
         router.addMimeType({ext:'.mp4', mime:'video/mp4'});
     ```

  - **getMime(file):** Retrieves mime type
    ```js
        var type = router.getMimeType('img.jpg');
    ```

  - **send(msg):** Sends data
    ```js
        var body = ['<!DOCTYPE html>',
         '<html ng-app="tessel">',
            '<head>',
            '</head>',
         '<body style="background-color:#222;">',
         '</body>',
         '</html>'].join('\n');

         res.send(body);
    ```

  - **sendImage(img):** Sends an image
    ```js
        res.sendImage(image);
    ```

##Examples:
----------

###Tessel lights
```js
var router = require('tiny-router'),
    tessel = require('tessel');

var lights = { 
    green: tessel.led[0], 
    blue: tessel.led[1], 
    red: tessel.led[2],
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
###Tessel Camera Module
```js
var tessel = require('tessel'),
    router = require('tiny-router'),
    camera = require('camera-vc0706').use(tessel.port['A']);

router.get('/', function(req, res){
       var body = ['<!DOCTYPE html>',
        '<html ng-app="tessel">',
           '<head>',
            '<title>Camera Module</title>',
            '<link href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css" rel="stylesheet"/>',
            '<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.17/angular.min.js"></script>',
           '</head>',
        '<body style="background-color:#222;">',
            '<div class="col-md-6 col-md-offset-3 text-center" ng-controller="MainCtrl">',
                '<img src="https://s3.amazonaws.com/technicalmachine-assets/technical-io/tessel-name.png" style="width: 200px; margin: 10px"/>',
                '<img ng-src="{{imgUrl}}" class="img-thumbnail" style="background-color:#fff;min-width:640px;height:480px"/>',
                '<p class="text-center" style="margin:10px">',
                    '<button ng-disabled="downloading" ng-click="takePicture()" class="btn btn-danger"><i class="glyphicon glyphicon-camera"></i></button>',
                '</p>',
            '</div>',
            '<script>',
                "angular.module('tessel', [])",
                ".controller('MainCtrl', function ($scope){",
                    "$scope.takePicture = function(){",
                        "$scope.downloading=true;",
                        "$scope.imgUrl = 'http://' + location.host + '/picture/' + Math.floor(Math.random()*10000);",
                        "setTimeout(function(){ $scope.downloading = false; $scope.$apply(); }, 10000);",
                    "};",
                 "});",
            '</script>',
        '</body>',
    '</html>'].join('\n');
    res.send(body);
});

router.get('/picture/{random}', function(req, res){
   camera.takePicture(function(err, image){
      if(err) {
          res.send('Unable to take a picture');
      }else{
          res.sendImage(image);
      }
   });
});

camera.on('ready', function(){
    //Server is running | Blue light on
    tessel.led[1].write(1);
    router.listen(8080);
});

camera.on('error', function(){
   //Turn Blue light off if on and turn red light on
    tessel.led[1].write(0);
    tessel.led[2].write(1);
});
```

###Raspberry Pi
```js
    var router = require('tiny-router'),
        gpio = require('pi-gpio');

    var readPin = function(pin, cb, errCb){
            gpio.open(pin, 'input', function(err){
                if(!err){
                    gpio.read(pin, function(err, value){
                        if(!err) {
                            if(cb) { cb(value); }
                            gpio.close(pin);
                        }else{
                            if(errCb) { errCb(); }
                        }
                    });
                }else{
                    if(errCb) { errCb(); }
                }
            });
        },
        writePin = function(pin, val, cb, errCb){
            gpio.open(pin, 'output', function(err) {
                if(!err){
                    gpio.write(pin, val, function(err) {
                        if(!err){
                            if(cb) { cb(val); }
                            gpio.close(pin);
                        }else{
                            if(errCb) { errCb(); }
                        }
                    });
                }else{
                    if(errCb) { errCb(); }
                }
            });
        };

    router.get('/', function(req, res){
        res.send('Simple Light API');
    });

    router.get('/light/status/{pin}', function(req, res){
        var pin = req.body.pin;
        readPin(pin, function(val){
           res.send({pin: pin, status: val, success: true});
        }, function(){
            res.send({error: 'Cannot read pin ' + pin, success: false});
        });
    });

    router.get('/light/off/{pin}', function(req, res){
        var pin = req.body.pin;
        writePin(pin, 0, function(){
            res.send({success: true, pin: pin, status: 1});
        }, function(){
            res.send({error: 'Cannot turn off pin ' + pin, success: false});
        });
    });

    router.get('/light/on/{pin}', function(){
        var pin = req.body.pin;
        writePin(pin, 1, function(val){
            res.send({success: true, pin: pin, status: val});
        }, function(){
            res.send({error: 'Cannot turn on pin ' + pin, success: false});
        });
    });

    router.listen(8080);
```

###BeagleBone 

```js
    coming soon
```

Version
----

0.0.7: Added the sendImage method. Great for creating app to work with Tessel Camera module
0.0.8: Added the example folder
0.0.9: Minor changes to the gitignore file
0.1.0 Adding sample code for Raspberry Pi
0.1.2 Changing internal method to Async in order to interact with the filesystem.



License
----

MIT


**Free Software, Hell Yeah!**