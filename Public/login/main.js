
var socket = io();

function loginPressed() {
    socket.emit('login', { email: document.getElementById('email').value, password: document.getElementById('password').value });
}

function loginResult(data) {
    console.log(data);
    if (data.valid) {
        window.location.href = 'http://localhost:8888/game';
    }
}
socket.on('login_result', loginResult);

function load()
{
    document.getElementById("password").addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
            document.getElementById("login").click();
        }
    });
    socket.emit('page_setup', { page: PAGE.LOGIN });
    document.getElementById('login').addEventListener('click', loginPressed);
}
window.addEventListener('load', load);