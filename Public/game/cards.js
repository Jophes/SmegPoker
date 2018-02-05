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
var tablecards = [];
var Players = [];
var Round;

var Pot = 0;
var Blind = 10;
var Raise = false;

function Main()
{
    MakeDeck();
    ShuffleDeck(cards);
    StartGame();

    CheckDeck();
}

function StartGame()
{
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

    Round = 1;
    DealerCards();
}

function bet(player)
{
    if (Players[player].Currency - Blind > 0)
    {
        Players[player].Currency -= Blind;
        Pot += Blind;
    
        console.log(Players[player].Currency);
        console.log(Pot);
    }
    else
    {
        Pot += Players[player].Currency;
        Players[player].Currency = 0;
        console.log("ALL IN!")
    }
}
function raise(player)
{
    if (Players[player].Currency - Blind * 2 > 0)
    {
        Blind *= 2;
        bet(player);
    }
    else 
    {
        bet(player);
    }
}

function fold(player)
{
    Players[player].PlayerState = pState.FOLD;
}

function CheckDeck()
{
    for (const key in cards) {
        if (cards.hasOwnProperty(key)) {
            const card = cards[key];
            if (card.Owner != "Deck")
            {
                var para = document.createElement('p');
                para.innerHTML = "This card is: " + card.fullname + " - Owner: " + card.Owner;
                document.body.appendChild(para);
            }
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
    if (Round == 2)
    {
        while (dealerCards < 4)
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
    if (Round == 3)
    {
        while (dealerCards < 5)
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
    this.PlayerState = pState.STANDBY;
}

function ShuffleDeck(cards)
{
    //Fisher-Yates (AKA Knuth) Shuffle
    var index = cards.length;
    var temp, rand;
    while (index != 0)
    {
        rand = Math.floor(Math.random() * index);
        index--;
        temp = cards[index];
        cards[index] = cards[rand];
        cards[rand] = temp;
    }
    return cards;
}

function DetermineHandRank(phand)
{
    var handplustable = phand.concat(tablecards);
    var totalsuits = [], totalnums = [];
    var ismatchingsuits, ismatchingnumbers;
    var suitpointer;
    var firstsuit = true;

/*
    Hand Rank based on highest number on hand:
    - High Numbers 2-14
    - Pair 15 - 27
    - Two pair 28 - 40
    - Three of a kind 41 - 53
    - Straight 54 - 64
    - Flush 65 - 69
    - Full house 70 - 226
    - Four of a kind 227 - 240
    - Straight flush 241 - 251
    - Royal 252 - 255

    This excludes kickers, kickers will have to be calculated outside this function just to keep things relatively simple
*/

        //Putting all the suits and corresponding numbers in two arrays
        for (const key in handplustable)
        {
            if (handplustable.hasOwnProperty(key)){
                const card = handplustable[key];
                totalsuits.push(card.suitnum);
                totalnums.push(card.Number);
            }
        }
        totalsuits.sort();
        totalnums.sort();

        //Check for suits - Royal Flush, Straight Flush or Flush
        for (const key in totalsuits)
        {
            if (totalsuits.hasOwnProperty(key)){
                const suit = totalsuits[key];
                if (firstsuit == true) 
                {
                    suitpointer = suit.suitnum;
                    ismatchingsuits = true;
                    firstsuit = false;
                }
                else if (suitpointer != suit.suitnum) ismatchingsuits = false;
            }
        }
        
        //Check if any of the flushes are present
        if (ismatchingsuits)
        {
            for (const key in totalnums){
                if (totalnums.hasOwnProperty(key)){
                    const num = totalnums[key];
                    
                }
            }
        }

        //Straight Flush = 9
        //if (handplustable)
}
window.addEventListener('load', Main);