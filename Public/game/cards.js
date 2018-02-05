var html =  "<h1>Start of JS</h1><h2>End of JS</h2>";
var cards = [];

function Main()
{
    MakeDeck();
    //html += "<p>This card is: " + cards[0, 0] + "</p>";
    for (const key in cards) {
        if (cards.hasOwnProperty(key)) {
            const card = cards[key];
            var para = document.createElement('p');
            para.innerHTML = "This card is: " + card;
            document.body.appendChild(para);
        }
    }
    

    // for (const card in cards) {
    //     if (cards.hasOwnProperty(card)) {
    //         const element = cards[card];
            
    //     }
    // }
    //document.body.innerHTML = html;
}
window.addEventListener('load', Main);


function MakeDeck()
{   
    for (var suit = 0; suit < 4; suit++)
    { 
        var suitname;
        switch(suit)
        {
            case 0: suitname = "Spades"; break;
            case 1: suitname = "Clubs"; break;
            case 2: suitname = "Hearts"; break;
            case 3: suitname = "Diamonds"; break;
            default: suitname = "Joker"; break;
        }
        for (var number = 0; number < 14; number++)
        {
            var numdisplay;
            switch (number)
            {
                case 0: numdisplay = "Ace"; break;
                case 11: numdisplay = "Jack"; break;
                case 12: numdisplay = "Queen"; break;
                case 13: numdisplay = "King"; break;
                default: numdisplay = number; break;
            }
            cards.push(numdisplay + " of " + suitname);
        }
    }
}