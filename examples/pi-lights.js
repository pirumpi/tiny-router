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
    writePin(pin, 0, function(val){
        res.send({success: true, pin: pin, status: val});
    }, function(){
        res.send({error: 'Cannot turn off pin ' + pin, success: false});
    });
});

router.get('/light/on/{pin}', function(){
    var pin = req.body.pin;
    writePin(pin, 1, function(){
        res.send({success: true, pin: pin, status: 1});
    }, function(){
        res.send({error: 'Cannot turn on pin ' + pin, success: false});
    });
});

router.listen(8080);