redirect = true;

function loginPressed() {
    socket.emit('login', { email: document.getElementById('email').value, password: document.getElementById('password').value });
}

function loginResult(data) {
    console.log(data);
    if (data.valid) {
        if (data.token != null) {
            var d = new Date();
            d.setTime(d.getTime() + 5529600000);
            document.cookie = 'token=' + data.token + ';expires=' + d.toUTCString() + ';path=/';
        }
        window.location.href = './browse';
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