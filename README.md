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
    coming soon
```

###BeagleBone 

```js
    coming soon
```

Methods
----------
 - **use:** Allow to overwrite default values configurations: ('static', 'defaultPage') and default methods: ('readFile', 'fileExist') this is useful when different embedded system read the file system differently.
    ```js
        //Changing defaultPage
        router.use('defaultPage', 'default.html');
    ```
    
    ```js
        //Setting a public folder
        router.use('static', {path: __dirname + '/public'});
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

Version
----

0.0.7: Added the sendImage method. Great for creating app to work with Tessel Camera module
0.0.8: Added the example folder
0.0.9: Minor changes to the gitignore file


License
----

MIT


**Free Software, Hell Yeah!**