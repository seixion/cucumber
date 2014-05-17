
var require;
(function (){
    var debug = false;
    // DEVLOPMENT
    if (debug) {
        require = {
            baseUrl: "js/src",
            urlArgs: "cacheBust="  + new Date().getTime()
        }
    }
    // PRODUCTION
    else {
        require = {
            baseUrl: "js/bin",
            paths: {
                "requireConfig": "app-compiled"
            }
        }
    }
}());