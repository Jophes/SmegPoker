var express = require('express');
var cookieParser = require('cookie-parser');
//var bcrypt = require('bcrypt');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const port = process.env.PORT || 8888;
const validChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function GetTime() {
    var time = new Date();
    var secs = (time.getSeconds() + time.getMilliseconds() * 0.001).toFixed(3)
    var seconds = (secs.length < 6 ? '0' : '') + secs;
    var minutes = (time.getMinutes().toString().length < 2 ? '0' : '') + time.getMinutes();
    var hours = (time.getHours().toString().length < 2 ? '0' : '') + time.getHours();
    return '' + hours + ':' + minutes + ':' + seconds + ' -';
}

// Listen for connections
function HandleServerStartup() {
    console.log(GetTime() + ' [SERVER] Server listening on port %d', port);
}
server.listen(port, HandleServerStartup);


// -- Express routing --
function AppLog(msg, req) {
    console.log(GetTime() + ' [APP] ' + msg + ' {' + req.ip + ':' + req.client.remotePort + '}');
}

function LogRequests(req, res, next) {
    AppLog('Recieved ' + req.method + ' request for "' + req.url + '" from', req);
    next();
}

/*function genSSID() {  // ADD CHECKS TO PREVENT DUPLICATE KEYS
    var ssid = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
    for( var i=0; i < 85; i++ )
        ssid += possible.charAt(Math.floor(Math.random() * possible.length));
    return ssid;
}*/

const renameTable = {'/' : '/index.html', '/login' : '/login/index.html', '/register' : '/register/index.html' };
function HandlePageGetRequest(req, res, next) {
    if (req.method == 'GET' && renameTable.hasOwnProperty(req.url))
    {
        var reqUrl = renameTable[req.url];
        //AppLog('Serving "' + reqUrl + '" to', req);
        var options = {
            root: __dirname + '/public/',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };

        /*var cookies = req.cookies;
        // Check if SESSID cookie exists
        if (cookies.SESSID === undefined || (cookies.SESSID && cookies.SESSID.length != 85))
        {
            // If it does not exist, create a new session cookie
            var ssid = genSSID().toString();
            res.cookie('SESSID', ssid, { httpOnly: false });
        }*/

        res.sendFile(reqUrl, options, function (err) {
            if (err) {
                next(err);
            } else {
                AppLog('Served "' + reqUrl + '" to', req);
            }
        });
    }
    else
    {
        //AppLog('Recieved invalid request for ' + req.url + ' from', req);
        next();
    }
}

app.use(cookieParser());
app.use(LogRequests);
app.use(HandlePageGetRequest)
app.use(express.static(__dirname + '/Public'));

// Socket.IO

io.on('connection', function(client) {
    var connection = { id: idCounter, socket: client, address: client.request.connection };
    function log (message) { console.log(connection.address.remoteAddress + ':' + connection.address.remotePort + ' id:' + connection.id + ' > ' + message); }

    log('Client connected');
});
