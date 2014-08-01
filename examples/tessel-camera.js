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