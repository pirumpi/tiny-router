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