var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var currentDate = function DOBList()
{
    var today = new Date();
    var dd = today.getDate();
    var mm = months[today.getMonth()];
    var yyyy = today.getFullYear();
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
    document.getElementById("dob").min = currentDate();
}
document.addEventListener("load", load);