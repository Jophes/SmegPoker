function createPressed() {
    socket.emit('createRoom', { name: document.getElementById('roomName').value, token: token });
}

function createResult(data) {
    console.log(data);
}
socket.on('createRoom_result', createResult);

function getRoomsResult(data) {
    console.log(data);
    var ul = document.getElementById('roomList');
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
    for (const i in data.rooms) {
        if (data.rooms.hasOwnProperty(i)) {
            const room = data.rooms[i];
            var li = document.createElement('li');
            var btn = document.createElement('button');
            btn.innerHTML = room.id + ': ' + room.name;
            btn.addEventListener('click', function() {
                joinRoom(room.id);
            });
            li.appendChild(btn);
            ul.appendChild(li);
        }
    }
}
socket.on('getRooms_result', getRoomsResult);

function joinRoom(roomId) {
    console.log('join room: ' + roomId);
    socket.emit('joinRoom', { id: roomId });
}

function joinRoomResult(data) {
    console.log(data);
    if (data.valid) {
        window.location.href = './lobby';
    }
}
socket.on('joinRoom_result', joinRoomResult);

function load()
{
    socket.emit('page_setup', { page: PAGE.BROWSE });
    socket.emit('getRooms', { });
    document.getElementById('roomName').addEventListener('keydown', function(event) {
        if (event.keyCode === 13) {
            document.getElementById('create').click();
        }
    });
    document.getElementById('create').addEventListener('click', createPressed);
}
window.addEventListener('load', load);