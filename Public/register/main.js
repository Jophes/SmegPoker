
var socket = io();

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function DOBList()
{
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear()-18;
    if (dd < 10)
    {
        dd = '0' + dd;
    }
    if (mm < 10)
    {
        mm = '0' + mm;
    }
    today = yyyy+'-'+mm+'-'+dd;
    
    return today;
}

function load()
{
    document.getElementById('dob').max = DOBList();
    socket.emit('page_setup', { page: PAGE.REGISTER });
}
window.addEventListener('load', load);
