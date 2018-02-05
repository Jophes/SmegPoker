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
    today = dd+'-'+mm+'-'+yyyy;
    
    return date;
}

document.getElementById(dob).addEventListener("load", DOBList).min = currentDate;