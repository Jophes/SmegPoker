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
var Players = [];
var Round;

function Main()
{
    MakeDeck();

    for(var i = 0; i < 3; i++)
    {
        Players.push(new Player(i));
    }
    
    for (const key in Players) {
        if (Players.hasOwnProperty(key)) {
            const element = Players[key];
            PlayerCards(element);            
        }
    }
    //PlayerCards(Players[0]);

    Round = 1;
    DealerCards();

    CheckDeck();
}

function CheckDeck()
{
    for (const key in cards) {
        if (cards.hasOwnProperty(key)) {
            const card = cards[key];
            var para = document.createElement('p');
            para.innerHTML = "This card is: " + card.fullname + " - Owner: " + card.Owner;
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

function PlayerCards(player)
{
    while (player.PlayerHand < 2)
    {
        var cardId = Math.floor(Math.random() * 52);
        if (cards[cardId].Owner == "Deck")
        {
            //Player.PlayerCards[i] = cards[cardId];
            cards[cardId].Owner = player.PlayerId;
            player.PlayerHand++;
        }
    }
}

function DealerCards()
{
    var dealerCards = 0;
    if (Round == 1)
    {
        while (dealerCards < 3)
        {
            var cardId = Math.floor(Math.random() * 52);
            if (cards[cardId].Owner == "Deck")
            {
                //Player.PlayerCards[i] = cards[cardId];
                cards[cardId].Owner = "Dealer";
                dealerCards++;
            }
        }
    }
}

function Player(Id)
{
    this.SessionId;
    this.PlayerHand = 0;
    this.PlayerId = Id;
    this.Currency = 100;
}

window.addEventListener('load', Main);