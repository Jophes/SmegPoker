function PlayingCard(suit, num, own) 
{
    this.suitnum = suit;
    this.Number = num;
    this.Owner = own;
    switch(suit)
    {
        case 0: this.suitname = "Spades"; break;
        case 1: this.suitname = "Clubs"; break;
        case 2: this.suitname = "Hearts"; break;
        case 3: this.suitname = "Diamonds"; break;
        default: this.suitname = "Joker"; break;
    }
    switch (num)
    {
        case 0: this.numdisplay = "Ace"; break;
        case 11: this.numdisplay = "Jack"; break;
        case 12: this.numdisplay = "Queen"; break;
        case 13: this.numdisplay = "King"; break;
        default: this.numdisplay = num; break;
    }
    this.fullname = this.numdisplay + " of " + this.suitname;
}

var cards = [];

function Main()
{
    MakeDeck();
}

function CheckDeck()
{
    for (const key in cards) {
        if (cards.hasOwnProperty(key)) {
            const card = cards[key];
            var para = document.createElement('p');
            para.innerHTML = "This card is: " + card.fullname;
            document.body.appendChild(para);
        }
    }
}

function MakeDeck()
{   
    for (var suit = 0; suit < 4; suit++){ 
        for (var number = 0; number < 14; number++){
            cards.push(new PlayingCard(suit, number, "Deck"));
        }
    }
}

function Player(cards)
{
    for(var i = 0; i < 2; i++)
    {
        Math.floor(Math.random() * 52);
    }
}

window.addEventListener('load', Main);