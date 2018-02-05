Main();

var html =  "<h1>Start of JS</h1><h2>End of JS</h2>";

function Main()
{
    DeclareCards();
    document.body.innerHTML = html;
}

function DeclareCards()
{
    var cards;

    for (var suit = 0; suit < 4; suit++)
    { 
        var suitname;
        switch(suit)
        {
            case 0: suitname = "Spades"; break;
            case 1: suitname = "Clovers"; break;
            case 2: suitname = "Hearts"; break;
            case 3: suitname = "Diamonds"; break;
            default: break;
        }
        for (var number = 0; number < 13; number ++)
        {
            cards [suit, number] = 
        }
    }
}