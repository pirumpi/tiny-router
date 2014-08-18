var http = require('http'),
    path = require('path'),
    router = function(){
        this.routes = [];
        this.mdware = [];
        this.methods = ['GET', 'POST', 'PUT', 'DELETE'];
        this.init();
        this.static = null;
        this.defaultPage = 'index.html';
        this.fs = require('fs');
        this.mimes = [
            {
              ext: '.js',
              mime:'application/javascript'
            },
            {
               ext: '.css',
               mime:'text/css'
            },
            {
               ext: '.jpg',
               mime:'image/jpeg'
            },
            {
               ext: '.css',
               mime:'image/png'
            }];
    };

/*Generate routing methods based on the supported methods*/
router.prototype.init = function(){ //Create routing method dynamically
    this.methods.forEach(function(method){
        router.prototype[method.toLowerCase()] = function(route, cb){
            this.response(route, cb, method);
            return this;
        };
    });
};
/*Extend supported methods {GET, POST, PUT, DELETE}*/
router.prototype.addMethod = function(method){
    this.methods.push(method.toUpperCase());
    this.init();
    return this;
};
/*Modify default values or methods*/
router.prototype.use = function(param, val){
    if(typeof param === 'function'){
        this.mdware.push(param);
    }else{
        this[param] = val;
    }
    return this;
};
/* Allow user to extend the mime type supported */
router.prototype.addMimeType = function(mimeType){
    this.mimes.push(mimeType);
    return this;
};
/*Retrieve Mime type*/
router.prototype.getMime = function(file){  //Retrieve the mime type
    for(var i = 0; i < this.mimes.length; i++){
        if(file.indexOf(this.mimes[i].ext) != -1){
            return this.mimes[i].mime;
        }
    }
    return 'text/html';
};
/*Default method call*/
router.prototype.response = function(route, cb, method){
    var routeObj = {callback: cb, method: method};
    if(route.indexOf('{') != -1){   //Check for object variables in the routing config
        var obNameBrt = basename(route);
        var obName = obNameBrt.replace('{', '').replace('}', ''); //Getting variable name
        routeObj.route = dirname(route);
        routeObj.hasObject = true;
        routeObj.objectName = obName;
        this.routes.push(routeObj); //Adding route to routing table
    }else{
        this.routes.push({route: route, callback: cb, method: method});
    }
};
/*Simplify the res.write and res.end method by allowing JSON and numbers*/
router.prototype.sendFn = function(){
    var contentType = 'text/plain';
    switch (typeof arguments[0]){
        case 'string':
            contentType = 'text/html';
            break;
        case 'number':
            arguments[0] = arguments[0].toString(); //Converting number to string
            break;
        case 'object':
            contentType = 'application/json';
            arguments[0] = JSON.stringify(arguments[0]); //Converting objects to string
            break;
    }
    this.writeHead(200, {'Content-Type':contentType, 'Access-Control-Allow-Origin':'*'}); //Allow Ajax from remote application
    this.end(arguments[0]);
};
router.prototype.sendImageFn = function(){
    var image = arguments[0],
        contentType = typeof arguments[1] !== 'undefined' ? arguments[1] : 'image/jpeg';
    this.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': image.length,
        'Access-Control-Allow-Origin':'*'
    });
    this.end(image);
};
/*Users can overwrite this method to use the embed their embed system API*/
router.prototype.fileExist = function(file, cb){
    this.fs.exists(file, function(exists){
        cb(exists);
    });
};

/*Users can overwrite this method to use the embed their embed system API*/
router.prototype.readFile = function(file, cb){
    this.fs.readFile(file, function(err, data){
        cb(err, data);
    });
};

/*Searching and Reading the file system*/
var findPath = function(req, res, router, cb){
        var url = ( req.url === '/' ) ? '/'+ router.defaultPage : req.url;
        var source = router.static.path + url;//path.resolve(router.static.path, '.'+url);
        if(url.indexOf('.') != -1){
            router.readFile(source, function(err, data){
                if(!err){
                    res.writeHead(200,{'Content-Type':router.getMime(url), 'Content-Length': data.length});
                    res.end(data.toString());
                }else{
                    cb();
                }
            });
        }else{
            cb();
        }
    },
    middleware = function (arr, req, res, indx, cb){
        if(arr.length === indx){ cb(); }else {
            arr[indx](req, res, function () {
                middleware(arr, req, res, ++indx, cb);
            });
        }
    },
    routeFn = function(req, res, router){
        if(router.static){
            findPath(req, res, router, function(){
                if(!routeFinder(router, req, res)){ routeNoFound(req, res); }
            });
        }else{
            if(!routeFinder(router, req, res)){ routeNoFound(req, res); }
        }
    },
    routeNoFound = function(req, res){
        res.writeHead(404);
        res.end('Route ' + req.url + ' is not configured');
    },
    routeFinder = function(router, req, res){
        var routeFound = false,
            url = req.url,
            method = req.method;
        for(var i = 0; i < router.routes.length; i++){
            var route = router.routes[i];
            if(url.indexOf(route.route) != -1  && route.method == method){
                if(url != '/' && route.route == '/') { continue; }
                if(url != route.route && !route.hasObject) { continue; }
                if(method === 'GET'){
                    req.body = {};
                    if(route.hasObject){ req.body[route.objectName] = basename(url); }
                    route.callback(req, res);
                    routeFound = true;
                    break;
                }else{
                    ReqToObject(req, res, route);
                    routeFound = true;
                    break;
                }
            }
        }
        return routeFound;
    },
    augmentedFn = function(req, res, router){
        res.send = function(){
            router.sendFn.apply(res, arguments);
        };
        res.sendImage = function(){
            router.sendImageFn.apply(res, arguments);
        };
    },
    ReqToObject = function(req, res, route){
        req.on('data', function(data){
            req.body = queryStringToJSON(data.toString());
            route.callback(req, res);
        });
    };

/*Routing table function*/
router.prototype.Router = function(){
    var router = this;
    var mdware = this.mdware;
    return function(req, res){
        augmentedFn(req, res, router);
        if(mdware.length){
            middleware(mdware, req, res, 0, function(){
                routeFn(req, res, router);
            });
        }else{
            routeFn(req, res, router);
        }
    };
};

/*Create an instance of http.createServer*/
router.prototype.listen = function(port){
    return http.createServer(this.Router()).listen(port);
};

/*Utils functions: many of this functions are supported natively in nodejs but there are not implemented yet in the espruino API
 and the idea behind this library is to support embed systems and that is why I added them here.*/
function queryStringToJSON(url) {
    if (url === '') {return '';}
    var pairs = (url).slice(0).split('&'), result = {};
    for (var idx in pairs) {
        var pair = pairs[idx].split('=');
        if (!!pair[0]){ result[pair[0].toLowerCase()] = decodeURIComponent(pair[1] || ''); }
    }
    return result;
}
function basename(path, suffix) {
    var b = path,
        lastChar = b.charAt(b.length - 1);
    if (lastChar === '/' || lastChar === '\\') { b = b.slice(0, -1);}
    b = b.replace(/^.*[\/\\]/g, '');
    if (typeof suffix === 'string' && b.substr(b.length - suffix.length) == suffix) {
        b = b.substr(0, b.length - suffix.length);
    }
    return b;
}
function dirname(path) {
    return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
}

module.exports = new router();