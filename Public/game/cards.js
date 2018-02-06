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
var tablecards = [];
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

    for (const key in totalhand)
    {
        if (totalhand.hasOwnProperty(key)){
            const card = totalhand[key];
            totalsuits.push(card.suitnum);
            totalnums.push(card.Number);
        }
    }

    //High Card
    var handvalue = 0;
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

    console.log(totalhand);

    for (const key in totalhand){
        if (cards.hasOwnProperty(key)){
            const card = totalhand[key];
            
        }
    }


    //Hand Rank based on highest number on hand: High card 7, Royal flush = 10

    /*
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

    console.log(totalsuits);
    console.log(totalnums);
    */
    /*
    //Check for suits - Royal Flush, Straight Flush or Flush
    for (const key in totalsuits)
    {
        if (totalsuits.hasOwnProperty(key)){
            const suit = totalsuits[key];
            if (firstofsuit == true) 
            {
                suitpointer = suit.suitnum;
                firstofsuit = false;
            }
            
            if (suitpointer == suit.suitnum)
            {
                suitcounter++;
                if (suitcounter >= 5) ismatchingsuits = true;
            }
            else
            {
                suitcounter = 0;
                suitpointer = suit.suitnum;
                firstofsuit = true;
            }
        }
    }

    
    //Check if any of the flushes are present
    if (ismatchingsuits)
    {
        //Royal Flush
        var isRoyal = false, isStraightFlush = false, isFlush = false;
        var cardcount = 0;
        for (var i = 0; i < totalnums.length; i++) 
        {
            if (totalnums[i] = 1)
            cardcount++;
            if (totalnums[i] != (14-i)) cardcount = 0;
            if (cardcount == 5) isRoyal = true;
        }

        //Straight Flush or Flush
        if (!isRoyal) 
        {
            cardcount = 0;
            for (var i = 0; i < (totalnums.length - 1); i++)
            {
                if (totalnums[i] = 1)
                if (totalnums[i+1] - totalnums[i] != 1)
                {
                    cardcount = 0;
                }
            }
        }
        
        if (isRoyal) return handvalue += 10;
        else if (isStraightFlush) return handvalue += 9;
        else if (isFlush) return handvalue += 5;
    }
    
    else
    {
        var paired = 0, three = false, isFour = false, isStraight = false;
        //High Num
        handvalue += 1;
        //Count paired
        for (const key in totalnums)
        {
            if (totalnums.hasOwnProperty(key)){
                const card = totalnums[key];
                if (key != totalnums.length)
                {
                    if (card == totalnums[key + 1]) paired++;
                }
            }
        }

        //Check for Straight
        for (const key in totalnums)
        {
            if (totalnums.hasOwnProperty(key)){
                const card = totalnums[key];
                if (key != totalnums.length)
                {
                    if (card == totalnums[key + 1]) paired++;
                }
            }
        }
    }*/
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