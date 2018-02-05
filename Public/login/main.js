
var socket = io();

function load()
{
    socket.emit('page_setup', { page: PAGE.LOGIN });
}
window.addEventListener('load', load);