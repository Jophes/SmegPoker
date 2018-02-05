var express = require('express');
var cookieParser = require('cookie-parser');
//var bcrypt = require('bcrypt');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const port = process.env.PORT || 8888;

const validChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const validEmailChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const PAGE = { NONE: 0, LOGIN: 1, REGISTER: 2, GAME: 3 };
var idCounter = 1;

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


// Page socket.io handlers
// - Login
function LoginPage() {
    var self = this;
    console.log('Login');

    this.addListeners = function(client) {
        self.cl = client;
    }

    this.removeListeners = function() {
    }
}

// - Register
function RegisterPage() {
    var self = this;

    console.log('Register');

    this.register = function(data) {
        //console.log('Client attempted to register');
        //console.log(data);
        var result = { valid: true };
        const keys = ['email', 'username', 'password', 'confirmPassword', 'dob'];
        const displayName = {'email': 'Email', 'username':'Username', 'password':'Password', 'confirmPassword':'Password Confirmation', 'dob':'Date of Birth'};
        for (const key in keys) {
            const resultKey = keys[key];
            if (data.hasOwnProperty(resultKey)) {
                const value = data[resultKey];
                if (resultKey != 'dob') {
                    if (value.length <= 3) {
                        result[resultKey] = { valid: false, message: displayName[resultKey] + ' must be longer than 3 characters'};
                        result.valid = false;
                    }
                    else if (resultKey == 'confirmPassword') {
                        if (value != data.password) {
                            result[resultKey] = { valid: false, message: displayName[resultKey] + ' is not the same as password'};
                            result.valid = false;
                        }
                        else {
                            result[resultKey] = { valid: true };
                        }
                    }
                    else {
                        result[resultKey] = { valid: true };
                    }
                }
                else {
                    if (value.length <= 0) {
                        result[resultKey] = { valid: false, message: 'A ' + displayName[resultKey] + ' must be selected'};
                        result.valid = false;
                    }
                    else {
                        result[resultKey] = { valid: true };
                    }
                }
            }
            else {
                result[resultKey] = { valid: false, message: displayName[resultKey] + ' is missing'};
                result.valid = false;
            }
        }
        self.cl.emit('register_result', result);
    }

    this.addListeners = function(client) {
        self.cl = client;
        self.cl.on('register', self.register);
    }

    this.removeListeners = function() {
        self.cl.removeListener('register', self.register);
    }
}

// - Game 
function GamePage() {
    var self = this;
    console.log('Game'); 

    this.addListeners = function(client) {
        self.cl = client;
    }

    this.removeListeners = function() {
    }
}

const pages = { };
pages[PAGE.LOGIN] = LoginPage;
pages[PAGE.REGISTER] = RegisterPage;
pages[PAGE.GAME] = GamePage;

// Socket.IO
io.on('connection', function(client) {
    var connection = { id: idCounter, socket: client, address: client.request.connection };
    var pageObj;
    idCounter++;
    function log (message) { console.log(GetTime() + ' [Socket.IO] ' + connection.address.remoteAddress + ':' + connection.address.remotePort + ' id:' + connection.id + ' > ' + message); }

    log('Client connected');

    function pageSetup(data) {
        if (data.page && pages.hasOwnProperty(data.page)) {
            pageObj = new (pages[data.page])();
            pageObj.addListeners(client);
        }
        client.removeListener('page_setup', pageSetup);
    }

    client.on('page_setup', pageSetup);
});
