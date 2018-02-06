
function cardSetup() {
    
}



function cardLoad() {
    socket.emit('page_setup', { page: PAGE.GAME });
}
window.addEventListener('load', cardLoad);