var token;
var redirect = false;
var loginRedirect = false;
if (io) {
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    var socket = io();

    token = getCookie('token');

    if (token == '') {
        console.log('No token found');
        setTimeout(function() {
            if (loginRedirect) {
                window.location.href = './';
            }
        }, 50);
    }
    else {
        socket.on('token_result', function(data) {
            if (data.valid) {
                console.log('Token valid! Uid: ' + data.user_id);
                if (redirect) {
                    window.location.href = './game';
                }
            }
            else {
                console.log('Token invalid.');
                if (loginRedirect) {
                    window.location.href = './game';
                }
            }
        });
    }
    
    socket.emit('token_check', { token: token });
}
