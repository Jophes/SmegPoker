function startPressed() {
    socket.emit('startRoom', { });
}

function startResult(data) {
    console.log(data);
}
socket.on('startRoom_result', startResult);

function load()
{
    socket.emit('page_setup', { page: PAGE.LOBBY });

    document.getElementById('start').addEventListener('click', startPressed);
}
window.addEventListener('load', load);