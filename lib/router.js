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

function ReqToObject(req, res, route){
    req.on('data', function(data){
        req.body = queryStringToJSON(data.toString());
        route.callback(req, res);
    });
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
function queryStringToJSON(url) {
    if (url === '') {return '';}
    var pairs = (url).slice(0).split('&'),
        result = {};
    for (var idx in pairs) {
        var pair = pairs[idx].split('=');
        if (!!pair[0]){ result[pair[0].toLowerCase()] = decodeURIComponent(pair[1] || ''); }
    }
    return result;
}
module.exports = new router();