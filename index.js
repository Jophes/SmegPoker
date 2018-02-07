const express = require('express');
const app = express();
const server = require('http').createServer(app);

//var cookieParser = require('cookie-parser');

const uuidv4 = require('uuid/v4');

var bcrypt = require('bcrypt');
const saltRounds = 10;

const mysql = require('mysql');
const con = mysql.createConnection({ host: "192.168.0.24", user: "student", password: "student", database: "smeg_poker" });

var io = require('socket.io')(server);
const port = process.env.PORT || 8888;

// ENUMS
const PAGE = { NONE: 0, LOGIN: 1, REGISTER: 2, BROWSE: 3, LOBBY: 4, GAME: 5 };
const pState = { PLAY: 0, STANDBY: 1, FOLD: 2};

function getTime() {
    var time = new Date();
    var secs = (time.getSeconds() + time.getMilliseconds() * 0.001).toFixed(3)
    var seconds = (secs.length < 6 ? '0' : '') + secs;
    var minutes = (time.getMinutes().toString().length < 2 ? '0' : '') + time.getMinutes();
    var hours = (time.getHours().toString().length < 2 ? '0' : '') + time.getHours();
    return '' + hours + ':' + minutes + ':' + seconds + ' -';
}

// Listen for connections
function handleServerStartup() {
    console.log(getTime() + ' [SERVER] Server listening on port %d', port);
}
server.listen(port, handleServerStartup);


// -- Express routing --
function appLog(msg, req) {
    console.log(getTime() + ' [APP] ' + msg + ' {' + req.ip + ':' + req.client.remotePort + '}');
}

function logRequests(req, res, next) {
    appLog('Recieved ' + req.method + ' request for "' + req.url + '" from', req);
    next();
} 

function generateUserToken(uid, func) { 
    var invalid = true, tokenStr;
    const tokenCheck = function() {
        tokenStr = uuidv4();
        con.query('SELECT token FROM smeg_poker.tokens WHERE token = ?;', [tokenStr], function(err, rows, fields) {
            if (err) {
                console.log('Failed to search database for generated token!');
                console.log(err);
            }
            else {
                var exists = false;
                for (const i in rows) {
                    exists = true;
                    break;
                }
                if (exists) {
                    //console.log('Found repeated token, trying again');
                    tokenCheck();
                }
                else {
                    //console.log('Found unique token: ' + tokenStr);
                    con.query('INSERT INTO smeg_poker.tokens (user_id, token) VALUES (?, ?);', [uid, tokenStr], function(err, rows, fields) {
                        if (err) {
                            console.log('Failed to add token!');
                            console.log(err);
                        }
                        else if (func != null) {
                            func(tokenStr);
                        }
                    });
                }
            }
        });
    }
    tokenCheck();
}

function validateUserToken(token, func) {
    con.query('SELECT tokens.user_id, users.name FROM smeg_poker.tokens, smeg_poker.users WHERE tokens.token = ? and tokens.user_id = users.id;', [token], function(err, rows, fields) {
        if (err) {
            console.log('Failed to search database for user token!');
            console.log(err);
        }
        else {
            var user_id, username;
            for (const i in rows) {
                user_id = rows[i].user_id;
                username = rows[i].name;
                break;
            }
            func(user_id, username);
        }
    });
}

const renameTable = {'/' : '/index.html', '/login' : '/login/index.html', '/register' : '/register/index.html' , '/browse' : '/browse/index.html' , '/lobby' : '/lobby/index.html' , '/game' : '/game/index.html' };
function handlePageGetRequest(req, res, next) {
    if (req.method == 'GET' && renameTable.hasOwnProperty(req.url))
    {
        var reqUrl = renameTable[req.url];
        //appLog('Serving "' + reqUrl + '" to', req);
        var options = {
            root: __dirname + '/public/',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };

        res.sendFile(reqUrl, options, function (err) {
            if (err) {
                next(err);
            } else {
                appLog('Served "' + reqUrl + '" to', req);
            }
        });
    }
    else
    {
        //appLog('Recieved invalid request for ' + req.url + ' from', req);
        next();
    }
}

app.use(logRequests);
app.use(handlePageGetRequest)
app.use(express.static(__dirname + '/public'));

// Page socket.io handlers
// - Login
function LoginPage() {
    var self = this;

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
            con.query('SELECT id, password FROM smeg_poker.users WHERE email = ?;', [data.email], function(err, rows, fields) {
                if (err) {
                    self.cl.log('Failed to search for users with given email!');
                    console.log(err);
                    self.loginResult.valid = false;
                }
                else {
                    var password, uid;
                    for (var i in rows) {
                        uid = rows[i].id;
                        password = rows[i].password;
                        break;
                    }
                    
                    if (password == null || uid == null) {
                        self.loginResult.email = { valid: false, message: displayName.email + ' does not exist'};
                        self.loginResult.valid = false;
                    }
                    else /*if (password != data.password)*/ { // REPLACE WITH HASH'd CHECK
                        bcrypt.compare(data.password, rows[i].password, function(err, res) {
                            if (err) {
                                self.cl.log('Failed to compare hashed password to login password!');
                                console.log(err);
                                self.loginResult.valid = false;
                            }
                            else {
                                if (!res) {
                                    self.loginResult.password = { valid: false, message: displayName.password + ' is incorrect'};
                                    self.loginResult.valid = false;
                                }
                                if (self.loginResult.valid) {
                                    generateUserToken(uid, function (token) {
                                        console.log('Unique token generated for uid('+uid+') - ' + token);
                                        self.loginResult.token = token;
                                        self.cl.emit('login_result', self.loginResult);
                                    });
                                }
                                else {
                                    self.cl.emit('login_result', self.loginResult);
                                }
                            }
                        });
                    }
                }
            });
        }
        else {
            self.cl.emit('login_result', self.loginResult);
        }
    }

    this.addListeners = function(client) {
        self.cl = client;
        self.cl.log('Login page listeners ready');
        self.cl.on('login', self.login);
    }
    
    this.authed = function(uid, username) {
        self.user_id = uid;
    }

    this.removeListeners = function() {
        self.cl.removeListener('login', self.login);
    }
    
    this.disconnect = function() {
        
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
                if (err) {
                    self.cl.log('Email & Username check failed! Error occured!');
                    console.log(err);
                }
                else {
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
                    if (self.registerResult.valid) { // HASH PASSWORD VALUE
                        bcrypt.hash(data.password, saltRounds, function(err, hash) {
                            if (err) {
                                self.cl.log('Password hashing failed!');
                                console.log(err);
                                self.registerResult.valid = false;
                            }
                            else {
                                con.query('INSERT INTO smeg_poker.users (name, email, password, dob) VALUES (?, ?, ?, ?);', [data.username, data.email, hash, data.dob], function(err, rows, fields) {
                                    if (err) {
                                        self.cl.log('User insert failed!');
                                        console.log(err);
                                        self.registerResult.valid = false;
                                        self.cl.emit('register_result', self.registerResult);
                                    }
                                    else {
                                        con.query('SELECT id FROM smeg_poker.users WHERE email = ?;', [data.email], function(err, rows, fields) {
                                            if (err) {
                                                self.cl.log('Failed to search for users with given email!');
                                                console.log(err);
                                            }
                                            else {
                                                var uid;
                                                for (var i in rows) {
                                                    uid = rows[i].id;
                                                    break;
                                                }
                                                if (uid != null) {
                                                    generateUserToken(uid, function (token) {
                                                        console.log('Unique token generated for uid('+uid+') - ' + token);
                                                        self.registerResult.token = token;
                                                        self.cl.emit('register_result', self.registerResult);
                                                    });
                                                }
                                                else {
                                                    self.cl.emit('register_result', self.registerResult);
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                    else {
                        self.cl.emit('register_result', self.registerResult);
                    }
                }
            });
        }
        else {
            self.cl.emit('register_result', self.registerResult);
        }
    }

    this.addListeners = function(client) {
        self.cl = client;
        self.cl.log('Register page listeners ready');
        self.cl.on('register', self.register);
    }
    
    this.authed = function(uid, username) {
        self.user_id = uid;
    }

    this.removeListeners = function() {
        self.cl.removeListener('register', self.register);
    }

    this.disconnect = function() {
        
    }
}

var rooms = {};
var roomCounter = 1;
//var room = { name: 'Room Name', creator: 0, users: [] };

function roomsCheck() {
    console.log('Rooms Check');
    for (const i in rooms) {
        if (rooms.hasOwnProperty(i)) {
            if (rooms[i].users.length <= 0) {
                delete rooms[i];
            }
        }
    }
}

// - Browser
function BrowsePage() {
    var self = this;

    this.getRooms = function(data) {
        self.getResult = { valid: true };
        if (self.user_id == null) {
            self.getResult.userid = { valid: false, message: 'Not signed in' };
            self.getResult.valid = false;
        }
        if (self.getResult.valid) {
            /*con.query('SELECT id, name FROM smeg_poker.rooms LIMIT 0, 256;', [], function(err, rows, fields) {
                if (err) {
                    console.log(err);
                }
                else {
                    var rooms = [];
                    for (const i in rows) {
                        if (rows.hasOwnProperty(i)) {
                            const row = rows[i];
                            rooms.push({id: row.id, name: row.name});
                        }
                    }
                    self.getResult.rooms = rooms;
                    self.cl.emit('getRooms_result', self.getResult);
                }
            });*/
            var roomList = [];
            for (const i in rooms) {
                if (rooms.hasOwnProperty(i)) {
                    const room = rooms[i];
                    roomList.push({name: room.name, id: room.id});
                }
            }
            self.getResult.rooms = roomList;
            self.cl.emit('getRooms_result', self.getResult);
        }
        else {
            self.cl.emit('getRooms_result', self.getResult);
        }
    }

    this.createRoom = function(data) {
        self.createResult = { valid: true };
        if (data.name == null) {
            self.createResult.name = { valid: false, message: 'Room name missing' };
            self.createResult.valid = false;
        }
        else if (data.name != null && data.name.length < 3) { 
            self.createResult.name = { valid: false, message: 'Room name must be longer than 3 characters' };
            self.createResult.valid = false;
        }
        if (self.user_id == null) {
            self.createResult.userid = { valid: false, message: 'Not signed in' };
            self.createResult.valid = false;
        }
        if (self.createResult.valid) {
            // Delete any rooms with creator which matches this user id
            for (const i in rooms) {
                if (rooms.hasOwnProperty(i)) {
                    const room = rooms[i];
                    for (const j in rooms.users) {
                        if (rooms.users.hasOwnProperty(j)) {
                            const user = rooms.users[j];
                            if (user == self.user_id) {
                                rooms.users.splice(j,1);
                                break;
                            }
                        }
                    }
                    if (room.creator == self.user_id) {
                        delete rooms[i];
                    }
                }
            }

            // Make sure there isn't a room with the name already existing
            var roomExists = false;
            for (const i in rooms) {
                if (rooms.hasOwnProperty(i)) {
                    const room = rooms[i];
                    if (room.name == data.name) {
                        roomExists = true;
                        break;
                    }
                }
            }
            if (roomExists) {
                self.createResult.name = { valid: false, message: 'Room already exists' };
                self.createResult.valid = false;
            }
            else {
                self.cl.log('UID: ' + self.user_id + ' Created room: ' + data.name);
                var room = {id: roomCounter++, name: data.name, creator: self.user_id, users: []};
                rooms[room.id] = room;
                self.joinRoom({id: room.id});
                //self.getRooms();
            }
            /*con.query('DELETE FROM smeg_poker.rooms WHERE creator=?;', [self.user_id], function(err, rows, fields) {
                if (err) {
                    console.log(err);
                }
                else {
                    con.query('SELECT name FROM smeg_poker.rooms WHERE name = ?;', [data.name], function(err, rows, fields) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            var exists = false;
                            for (const i in rows) {
                                exists = true;
                                break;
                            }
                            if (exists) {
                                self.createResult.name = { valid: false, message: 'Room already exists' };
                                self.createResult.valid = false;
                                self.cl.emit('createRoom_result', self.createResult);
                            }
                            else {
                                con.query('INSERT INTO smeg_poker.rooms (name, creator) VALUES (?, ?);', [data.name, self.user_id], function(err, rows, fields) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        self.cl.log('UID: ' + self.user_id + ' Created room: ' + data.name);
                                        self.cl.emit('createRoom_result', self.createResult);
                                        self.getRooms();
                                    }
                                });
                            }
                        }
                    });
                }
            });*/
        }
        //else {
            self.cl.emit('createRoom_result', self.createResult);
        //}
    }

    this.joinRoom = function (data) {
        self.joinResult = { valid: true };
        if (self.user_id == null) {
            self.joinResult.userid = { valid: false, message: 'Not signed in' };
            self.joinResult.valid = false;
        }
        if (data.id == null) {
            self.joinResult.roomId = { valid: false, message: 'Room id is missing' };
            self.joinResult.valid = false;
        }
        else if (!rooms.hasOwnProperty(data.id)) {
            self.joinResult.roomId = { valid: false, message: 'Room id doesn\'t exist' };
            self.joinResult.valid = false;
        }
        if (self.joinResult.valid) {
            self.cl.log('Joined room: ' + rooms[data.id].name);
            rooms[data.id].users.push(self.user_id);
        }
        self.cl.emit('joinRoom_result', self.joinResult);
    }

    this.addListeners = function(client) {
        self.cl = client;
        self.cl.log('Browser page listeners ready');
        self.cl.on('getRooms', self.getRooms);
        self.cl.on('createRoom', self.createRoom);
        self.cl.on('joinRoom', self.joinRoom);
    }
    
    this.authed = function(uid, username) {
        self.user_id = uid;
    }

    this.removeListeners = function() {
        self.cl.removeListener('getRooms', self.getRooms);
        self.cl.removeListener('createRoom', self.createRoom);
    }

    this.disconnect = function() {
        roomsCheck();
    }
}

// - Lobby
function LobbyPage() {
    var self = this;

    this.getLobbyInfo = function(data) {

    }

    this.getLobbyPlayers = function(data) {

    }

    this.addListeners = function(client) {
        self.cl = client;
        self.cl.log('Lobby page listeners ready');
    }

    this.authed = function(uid, username) {
        self.user_id = uid;
    }

    this.removeListeners = function() {
    }

    this.disconnect = function() {
        
    }
}
// POKER GAME STUFF

// Object type
function PlayingCard(suit, num) {
    var self = this;
    this.suitNumber = suit;
    this.number = num;
    switch(suit) {
        case 0: this.suitName = "Spades"; break;
        case 1: this.suitName = "Clubs"; break;
        case 2: this.suitName = "Hearts"; break;
        case 3: this.suitName = "Diamonds"; break;
        default: this.suitName = "Joker"; break;
    }
    switch (num) {
        case 1: this.numDisplay = "Ace"; break;
        case 11: this.numDisplay = "Jack"; break;
        case 12: this.numDisplay = "Queen"; break;
        case 13: this.numDisplay = "King"; break;
        default: this.numDisplay = num; break;
    }
    this.fullName = this.numDisplay + " of " + this.suitName;
    this.export = function() {
        return { suit: self.suitNumber, number: self.number };
    }
}

function Player(player_id) {
    var self = this;
    this.hand = [];
    this.uid = null;
    this.pid = player_id;
    this.name = null;
    this.money = 100;
    this.state = pState.STANDBY;
    this.exportPartial = function() {
        return { uid: self.uid, pid: self.pid, name: self.name, money: self.money };
    }
    this.exportFull = function() {
        var data = self.exportPartial();
        data.hand = [];
        for (const i in self.hand) {
            if (self.hand.hasOwnProperty(i)) {
                data.hand.push(self.hand[i].export());
            }
        }
        return data;
    }
}

function GameInstance() {
    var self = this;

    this.cards = [];
    this.dealer = [];
    this.players = [];

    this.round = 0;

    this.pot = 0;
    this.blind = 10;

    this.exportPlayers = function(pid) {
        var playerExport = [];
        for (const i in self.players) {
            if (self.players.hasOwnProperty(i)) {
                playerExport.push(i == pid ? self.players[i].exportFull() : self.players[i].exportPartial());
            }
        }
        return playerExport;
    }

    this.exportDealer = function() {
        var dealerExport = [];
        for (const i in self.dealer) {
            if (self.dealer.hasOwnProperty(i)) {
                dealerExport.push(i < (self.round + 3) ? self.dealer[i].export() : null);
            }
        }
        return dealerExport;
    }
    
    this.bet = function(pid) {
        if (self.players[pid].money > 0) {
            var amountBet = 0;
            if (self.players[pid].money - self.blind > 0) {
                amountBet = self.blind;
            }
            else {
                amountBet = self.players[pid].money;                
            }
            self.players[pid].money -= amountBet;
            self.pot += amountBet;
        }
    }
    this.raise = function(pid) {
        if (self.players[pid].money - self.blind * 2 > 0) {
            self.blind *= 2;
            self.bet(pid);
        }
        else {
            self.blind += self.players[pid].money;
            bet(pid);
        }
    }
    this.fold = function(pid) {
        self.players[pid].state = pState.FOLD;
    } 

    this.makeDeck = function() {   
        self.cards = [];
        for (var suit = 0; suit < 4; suit++) { 
            for (var number = 1; number < 14; number++){
                self.cards.push(new PlayingCard(suit, number));
            } 
        }
    }

    this.getHand = function(handCount) {
        var hand = [];
        for (let i = 0; i < handCount; i++) {
            const cardId = Math.floor(Math.random() * self.cards.length);
            hand.push(self.cards[cardId]);
            self.cards.splice(cardId,1);
        }
        return hand;
    }

    this.setupGame = function() {
        for (let i = 0; i < 5; i++) {
            self.players.push(new Player(i));
        }
        self.startGame();
    }

    this.startGame = function() {
        self.makeDeck();
        for (const key in self.players) {
            if (self.players.hasOwnProperty(key)) {
                self.players[key].hand = self.getHand(2);
            }
        }
        self.dealer = self.getHand(5);
    }
}

var games = [new GameInstance()];
games[0].setupGame();
var users = {};

// - Game -
function GamePage() {
    var self = this;
    self.gid = 0;

    this.addListeners = function(client) {
        self.cl = client;
        self.cl.log('Game page listeners ready');
    }

    this.authed = function(uid, username) {
        self.user_id = uid;
        self.username = username;
        for (const i in games[self.gid].players) {
            if (games[self.gid].players.hasOwnProperty(i)) {
                if (games[self.gid].players[i].uid == null) {
                    self.pid = games[self.gid].players[i].pid;
                    games[self.gid].players[self.pid].uid = self.user_id;
                    games[self.gid].players[self.pid].name = self.username;
                    break;
                }
            }
        }
        self.cl.log('User authed, adding to game. uid: ' + self.user_id + ' pid: ' + self.pid);
        self.cl.emit('card_setup', { players: games[self.gid].exportPlayers(self.pid), dealer: games[self.gid].exportDealer()});
    }

    this.removeListeners = function() {
    }

    this.disconnect = function() {
        games[self.gid].players[self.pid].uid = null;
        games[self.gid].players[self.pid].name = null;
        self.cl.log('User disconnected, removed from game');
    }
}

const pages = { };
pages[PAGE.LOGIN] = LoginPage;
pages[PAGE.REGISTER] = RegisterPage;
pages[PAGE.BROWSE] = BrowsePage;
pages[PAGE.LOBBY] = LobbyPage;
pages[PAGE.GAME] = GamePage;

// Socket.IO
io.on('connection', function(client) {
    var connection = { user_id: null, socket: client, address: client.request.connection };
    var pageObj;
    client.log = function(message) { console.log(getTime() + ' [Socket.IO] ' + connection.address.remoteAddress + ':' + connection.address.remotePort + /*' id:' + connection.id +*/ ' > ' + message); }

    client.log('Client connected');

    function tokenCheck(data) {
        validateUserToken(data.token, function(uid, name) {
            var token_result = { valid: false };
            if (uid != null) {
                connection.user_id = uid;
                connection.username = name;
                token_result.valid = true;
                token_result.user_id = uid;
                client.log('Token check determined user is uid: ' + uid);
                if (pageObj != null) {
                    pageObj.authed(connection.user_id, name);
                    users[uid] = { handle: pageObj };
                }
            }
            client.emit('token_result', token_result);
        });
    }
    client.on('token_check', tokenCheck);

    function pageSetup(data) {
        if (data.page && pages.hasOwnProperty(data.page)) {
            pageObj = new (pages[data.page])();
            pageObj.addListeners(client);
            client.on('disconnect', function() {
                pageObj.disconnect();
                if (pageObj.user_id && users[pageObj.user_id]) {
                    delete users[pageObj.user_id];
                }
            });
            if (connection.user_id != null) {
                pageObj.authed(connection.user_id, connection.username);
                users[connection.user_id] = { handle: pageObj };
            }
        }
        client.removeListener('page_setup', pageSetup);
    }
    client.on('page_setup', pageSetup);
});
