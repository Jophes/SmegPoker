var html =  "<h1>Start of JS</h1><h2>End of JS</h2>";
var cards = [4, 13];
Main();

function Main()
{
    MakeDeck();
}

function MakeDeck()
{   
    for (var suit = 0; suit < 4; suit++)
    { 
        var suitname;
        switch(suit)
        {
            case 0: suitname = "Spades"; break;
            case 1: suitname = "Clovers"; break;
            case 2: suitname = "Hearts"; break;
            case 3: suitname = "Diamonds"; break;
            default: suitname = "Joker"; break;
        }
        for (var number = 0; number < 14; number++)
        {
            var numdisplay;
            switch (number)
            {
                case 11: numdisplay = "Jack"; break;
                case 12: numdisplay = "Queen"; break;
                case 13: numdisplay = "King"; break;
                default: numdisplay = number; break;
            }
            cards [suit, number] = numdisplay + " of " + suitname;
            html += "<p>" + cards[suit, number] + "</p>";
        }
        document.body.innerHTML = html;
    }
}