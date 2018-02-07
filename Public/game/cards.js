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
    //Pair tests
    var pairtest1 = [cards[0], cards[14], cards[30], cards[5], cards[8], cards[21], cards[12]];
    var pairtest2 = [cards[13], cards[26], cards[17], cards[19], cards[21], cards[23], cards[25]];
    var pairtest3 = [cards[26], cards[39], cards[30], cards[32], cards[34], cards[36], cards[38]];
    var pairtest4 = [cards[39], cards[0], cards[43], cards[45], cards[47], cards[49], cards[51]];
    //Two pair tests
    var twopairtest1 = [cards[0], cards[13], cards[30], cards[5], cards[8], cards[21], cards[12]];
    //Threeofakind tests
    var threetest1 = [cards[0], cards[13], cards[26], cards[5], cards[8], cards[22], cards[12]];
    //Straight Tests
    var StraightTest1 = [cards[0], cards[1], cards[15], cards[16], cards[30], cards[8], cards[7]];

    //Flush Tests
    var flushtest1 = [cards[0], cards[2], cards[4], cards[6], cards[8], cards[10], cards[12]];
    var flushtest2 = [cards[13], cards[15], cards[17], cards[19], cards[21], cards[23], cards[25]];
    var flushtest3 = [cards[26], cards[28], cards[30], cards[32], cards[34], cards[36], cards[38]];
    var flushtest4 = [cards[39], cards[41], cards[43], cards[45], cards[47], cards[49], cards[51]];

    //Full house tests
    var fullhouse1 = [cards[0], cards[13], cards[26], cards[1], cards[14], cards[22], cards[45]];
    //Fourofakind tests
    var fourtest1 = [cards[0], cards[13], cards[26], cards[39], cards[8], cards[22], cards[12]];
    //Straight Flush tests
    var straightflushtest1 = [cards[2], cards[3], cards[4], cards[5], cards[6], cards[24], cards[51]];

    //Royal Flush tests
    var royalflushtest1 = [cards[0], cards[12], cards[11], cards[10], cards[9], cards[8], cards[7]];
    var royalflushtest2 = [cards[13], cards[25], cards[24], cards[23], cards[22], cards[21], cards[20]];
    var royalflushtest3 = [cards[26], cards[38], cards[37], cards[36], cards[35], cards[34], cards[33]];
    var royalflushtest4 = [cards[39], cards[51], cards[50], cards[49], cards[48], cards[47], cards[46]];

    var totalhand = [];
    
    var totalsuits = [], totalnums = [];
    var ismatchingsuits = false, ismatchingnumbers = false;
    var suitpointer, suitcounter = 0;
    var firstofsuit = true;
    /*
    for (const key in cards) {
        if (cards.hasOwnProperty(key)) {
            const card = cards[key];
            if (card.Owner == PlayerHandID) totalhand.push(card);
            if (card.Owner == "Dealer") totalhand.push(card);
        }
    }*/
    totalhand = fullhouse1;
    /*
    
    for (const i in self.players[PlayerHandID].hand) {
        if (self.players[PlayerHandID].hand.hasOwnProperty(i)) {
            totalHand.push(self.players[PlayerHandID].hand[i]);
        }
    }
    for (const i in self.dealer) {
        if (self.dealer.hasOwnProperty(i)) {
            totalHand.push(self.dealer[i]);
        }
    }
    
    */
    
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
    
    //console.log(totalhand);
    var samecards = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var pairs = 0; three = false; four = false;
    for (const key in totalhand){
        if (key >= totalhand.length) break;
        if (totalhand.hasOwnProperty(key)){
            const card = totalhand[key];
            samecards[card.Number]++;
        }
    }
    for (var i = 0; i < samecards.length; i++)
    {
        if (samecards[i] == 2) pairs++;
        else if (samecards[i] == 3) three = true;  
        else if (samecards[i] == 4) four = true;
    }

    console.log ("Pairs detected: " + pairs);
    console.log ("Three detected: " + three);
    console.log ("Four detected: " + four);

    if (four && handvalue < handStrength.FOURKIND) handvalue = handStrength.FOURKIND;
    else if (three && pairs > 0 && handvalue < handStrength.FULLHOUSE) handvalue = handStrength.FULLHOUSE;
    else if (three && handvalue < handStrength.THREEKIND) handvalue = handStrength.THREEKIND;
    else if (pairs > 1 && handvalue < handStrength.TWOPAIR) handvalue = handStrength.TWOPAIR;
    else if (pairs && handvalue < handStrength.PAIR) handvalue = handStrength.PAIR;

    //Flush and straights
    var straight = 0;
    var royalFlush = true;
    //Suit indexes - Spades: 0, Clubs: 1, Hearts: 2, Diamonds: 3
    var suitFlush = [0, 0, 0, 0];
    
    for (const key in totalhand) {
        if (totalhand.hasOwnProperty(key)) {
            const card = totalhand[key];
            suitFlush[card.suitnum]++;
            if (suitFlush[card.suitnum] == 5 && handvalue < handStrength.FLUSH) handvalue = handStrength.FLUSH;
        }
    }
    console.log("In flush with: " + suitFlush);
    
    for (let key = 0; key < totalhand.length - 1; key++) {
        const card = totalhand[key];
        if (card.Number - 1 == totalhand[key + 1].Number)
        {
            straight++;
        }
    }

    console.log("Straight coutner: " + straight);
    if (straight == 5)
    {
        if (handvalue < handStrength.STRAIGHT)
        {
            handvalue = handStrength.STRAIGHT;
        }
    }
    if (handvalue == handStrength.FLUSH && straight == 5)
    {
        handvalue = handStrength.STRAIGHTFLUSH;
        for (const key in totalhand) {
            if (totalhand.hasOwnProperty(key)) {
                const card = totalhand[key];
                if (card.Number > 1 || card.Number < 10)
                {
                    royalFlush = false;
                    break;
                }
            }
        }
        if (royalFlush) handvalue = handStrength.ROYAL;
    }
    console.log(totalhand);
    console.log("Hand Strength: " + handvalue);

    return handvalue;
}

function SecondaryCheck(totalhand)
{
    
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