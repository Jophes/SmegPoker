var express = require('express');
var cookieParser = require('cookie-parser');
//var bcrypt = require('bcrypt');
const saltRounds = 10;
var mysql = require('mysql');
var con = mysql.createConnection({ host: "cheeseserver1", user: "student", password: "student", database: "smeg_poker" });
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const port = process.env.PORT || 8888;

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

    this.login = function(data) {
        self.loginResult = { valid: true };
        const keys = ['email', 'password'];
        const displayName = {'email': 'Email', 'password':'Password'};
        for (const key in keys) {
            const resultKey = keys[key];
            if (data.hasOwnProperty(resultKey)) {
                const value = data[resultKey];
                if (value.length <= 3) {
                    self.loginResult[resultKey] = { valid: false, message: displayName[resultKey] + ' must be longer than 3 characters'};
                    self.loginResult.valid = false;
                }
                else {
                    self.loginResult[resultKey] = { valid: true };
                }
            }
            else {
                self.loginResult[resultKey] = { valid: false, message: displayName[resultKey] + ' is missing'};
                self.loginResult.valid = false;
            }
        }

        // Check if email is in the database
        if (self.loginResult.email.valid && self.loginResult.password.valid) {
            con.query('SELECT password FROM smeg_poker.users WHERE email = ?;', [data.email], function(err, rows, fields) {
                var password;
                for (var i in rows) {
                    password = rows[i].password;
                    break;
                }
                if (password == null) {
                    self.loginResult.email = { valid: false, message: displayName.email + ' does not exist'};
                    self.loginResult.valid = false;
                }
                else if (password != data.password) { // REPLACE WITH HASH'd CHECK
                    self.loginResult.password = { valid: false, message: displayName.password + ' is incorrect'};
                    self.loginResult.valid = false;
                }
                self.cl.emit('login_result', self.loginResult);
            });
        }
        else {
            self.cl.emit('login_result', self.loginResult);
        }
    }

    this.addListeners = function(client) {
        self.cl = client;
        self.cl.on('login', self.login);
    }

    this.removeListeners = function() {
        self.cl.removeListener('login', self.login);
    }
}

// - Register
function RegisterPage() {
    var self = this;

    this.register = function(data) {
        self.registerResult = { valid: true };
        const keys = ['email', 'username', 'password', 'confirmPassword'];
        const displayName = {'email': 'Email', 'username':'Username', 'password':'Password', 'confirmPassword':'Password Confirmation', 'dob':'Date of Birth'};
        for (const key in keys) {
            const resultKey = keys[key];
            if (data.hasOwnProperty(resultKey)) {
                const value = data[resultKey];
                if (value.length <= 3) {
                    self.registerResult[resultKey] = { valid: false, message: displayName[resultKey] + ' must be longer than 3 characters'};
                    self.registerResult.valid = false;
                }
                else {
                    self.registerResult[resultKey] = { valid: true };
                }
            }
            else {
                self.registerResult[resultKey] = { valid: false, message: displayName[resultKey] + ' is missing'};
                self.registerResult.valid = false;
            }
        }
        if (self.registerResult.confirmPassword.valid) {
            if (data.confirmPassword != data.password) {
                self.registerResult.confirmPassword = { valid: false, message: displayName.confirmPassword + ' is not the same as password'};
                self.registerResult.valid = false;
            }
        } 
        if (data.dob.length <= 0) {
            self.registerResult.dob = { valid: false, message: 'A ' + displayName.dob + ' must be selected'};
            self.registerResult.valid = false;
        }
        else {
            self.registerResult.dob = { valid: true };
        }

        // Check if email or username exists in the database
        if (self.registerResult.username.valid && self.registerResult.email.valid) {
            con.query('SELECT name, email FROM smeg_poker.users WHERE name = ? or email = ?;', [data.username, data.email], function(err, rows, fields) {
                for (var i in rows) {
                    if (rows[i].name == data.username) {
                        self.registerResult.username = { valid: false, message: displayName.username + ' is already taken' };
                        self.registerResult.valid = false;
                    }
                    if (rows[i].email == data.email) {
                        self.registerResult.email = { valid: false, message: displayName.email + ' is already taken' };
                        self.registerResult.valid = false;
                    }
                }
                if (self.registerResult.valid) {
                    con.query('INSERT INTO smeg_poker.users (name, email, password, dob) VALUES (?, ?, ?, ?);', [data.username, data.email, data.password, data.dob], function(err, rows, fields) {
                        if (err) {
                            self.registerResult.valid = false;
                        }
                        self.cl.emit('register_result', self.registerResult);
                    });
                }
                else {
                    self.cl.emit('register_result', self.registerResult);
                }
            });
        }
        else {
            self.cl.emit('register_result', self.registerResult);
        }
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
