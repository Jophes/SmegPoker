
var socket = io();

function loginPressed() {
    socket.emit('login', { email: document.getElementById('email').value, password: document.getElementById('password').value });
}

function loginResult(data) {
    console.log(data);
}
socket.on('login_result', loginResult);

function load()
{
    socket.emit('page_setup', { page: PAGE.LOGIN });
    document.getElementById('login').addEventListener('click', loginPressed);
}
window.addEventListener('load', load);