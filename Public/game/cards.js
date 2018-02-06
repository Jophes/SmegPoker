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
        case 1: this.numdisplay = "Ace"; break;
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

var Pot = 0;
var Blind = 10;
var Raise = false;

function Main()
{
    MakeDeck();
    //ShuffleDeck(cards);
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

    Round = 3;
    DealerCards();
}

function bet(player)
{
    if (Players[player].Currency - Blind > 0)
    {
        Players[player].Currency -= Blind;
        Pot += Blind;
        var curr = document.getElementById('CurrentWallet').innerHTML = Players[player].Currency;
    
        console.log(Players[player].Currency);
        console.log(Pot);
    }
    else
    {
        Pot += Players[player].Currency;
        Players[player].Currency = 0;
        var curr = document.getElementById('CurrentWallet').innerHTML = Players[player].Currency;
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
        Blind += Players[player].Currency;
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
        for (var number = 1; number < 14; number++){
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
    switch (Round)
    {
        case 1: 
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
            break;
        case 2:
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
            break;
        case 3:
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
            break;
    }
}

function Player(Id)
{
    this.SessionId;
    this.PlayerHand = 0;
    this.PlayerId = Id;
    this.Currency = 100;
    this.PlayerState = pState.STANDBY;
    var curr = document.getElementById('CurrentWallet').innerHTML = this.Currency;
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

function DetermineHandRank(PlayerHandID)
{
    var totalhand = [];
    for (const key in cards) {
        if (cards.hasOwnProperty(key)) {
            const card = cards[key];
            if (card.Owner == PlayerHandID) totalhand.push(card);
            if (card.Owner == "Dealer") totalhand.push(card);
        }
    }
    
    //var handplustable = phand.concat(tablecards);
    //var handplustable = totalhand;
    var totalsuits = [], totalnums = [];
    var ismatchingsuits = false, ismatchingnumbers = false;
    var suitpointer, suitcounter = 0;
    var firstofsuit = true;
    var flush = false;

    for (const key in totalhand)
    {
        if (totalhand.hasOwnProperty(key)){
            const card = totalhand[key];
            totalsuits.push(card.suitnum);
            totalnums.push(card.Number);
        }
    }

    //High Card
    var handvalue = handStrength.HIGH;
    var temp;

    //Bubble sort in descending order;
    for (var i = 0; i < totalnums.length; i++){
        for (var j = 0; j < (totalnums.length - 1); j++){
            if (totalhand[j].Number <  totalhand[j+1].Number)
            {
                temp = totalhand[j];
                totalhand[j] = totalhand[j+1];
                totalhand[j+1] = temp;
            }
        }
    }

    var samecards = [], index = 0;
    for (const key in totalhand){
        if (key >= totalhand.length) break;
        if (cards.hasOwnProperty(key)){
            const card = totalhand[key];
            if (card.Number == totalhand[key+1].Number)
            {
                samecards[index] += 1;
            }
            else if (samecards[index] != null)
            {
                index++;
            }
        }
    }

    if (samecards.length != 0)
    {
        var pairs = 0; three = false; four = false;
        for (var i = 0; i < samecards.length; i++)
        {
            switch(samecards[i])
            {
                case 1: pairs++; break;
                case 2: break;
                default: break;
            }
        }        
    }

    var straight = 0;
    var royalFlush = true;
    //Suit indexes - Spades: 0, Clubs: 1, Hearts: 2, Diamonds: 3
    var suitFlush = [];
    
    for (const key in totalhand) {
        if (totalhand.hasOwnProperty(key)) {
            const card = totalhand[key];
            suitFlush[card.suitnum]++;
        }
    }
    

    for (const key in totalhand) {
        if (totalhand.hasOwnProperty(key)) {
            const card = totalhand[key];
            if (card.num + 1 == totalhand[key+1].num)
            {
                straight++;
            }
        }
    }
    if (straight == 5)
    {
        if (handvalue < handStrength.STRAIGHT)
        {
            handvalue = handStrength.STRAIGHT;
        }
    }
    if (flush && handStrength == handStrength.STRAIGHT)
    {
        handvalue = handStrength.STRAIGHTFLUSH;
        for (const key in totalhand) {
            if (totalhand.hasOwnProperty(key)) {
                const card = totalhand[key];
                if (card.num > 1 || card.num < 10)
                {
                    royalFlush = false;
                    break;
                }
            }
        }
        if (royalFlush) handvalue = handStrength.ROYAL;
    }
}

function SearchForCard(_card, PTCards)
{
    for (const key in PTCards)
    {
        if (PTCards.hasOwnProperty(key))
        {
            const card = PTCards[key];
            if (card == _card) return true;
        }
    }
    return false;
}
window.addEventListener('load', Main);