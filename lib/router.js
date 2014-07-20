var methods = ['GET', 'POST'];
var router = function(){ this.routes = []; };

router.prototype.response = function(route, cb, method){
    var routeObj = {callback: cb, method: method};
    if(route.indexOf('{') != -1){
        var obNameBrt = basename(route);
        var obName = obNameBrt.replace('{', '').replace('}', '');
        routeObj.route = dirname(route);
        routeObj.hasObject = true;
        routeObj.objectName = obName;
        this.routes.push(routeObj);
    }else{
        this.routes.push({route: route, callback: cb, method: method});
    }
};

router.prototype.Router = function(){
    var routes = this.routes;
    return function(req, res){
        var routeFound = false,
            url = req.url,
            method = req.method;
        for(var i = 0; i < routes.length; i++){
            var route = routes[i];
            if(url.indexOf(route.route) != -1  && route.method == method){
                if(url != '/' && route.route == '/') { continue; }
                if(url != route.route && !route.hasObject) { continue; }
                if(route.hasObject){ req[route.objectName] = basename(url); }
                route.callback(req, res);
                routeFound = true;
                break;
            }
        }
        if(!routeFound){
            res.writeHead(404);
            res.end('Route is missing');
        }
    };
};

methods.forEach(function(method){
    router.prototype[method.toLowerCase()] = function(route, cb){
        this.response(route, cb, method);
    };
});

function basename(path, suffix) {
    var b = path;
    var lastChar = b.charAt(b.length - 1);
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