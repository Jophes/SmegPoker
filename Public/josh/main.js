var c, ctx;

const cPlyScale = 0.4, cOtherScale = 0.35
const cPlySize = { w: 223 * cPlyScale, h: 324 * cPlyScale }, cOtherSize = { w: 223 * cOtherScale, h: 324 * cOtherScale };

var cardTable = new Image();
cardTable.src = '../Resources/pokertable.png';

var cardImages = [];
cardImages[52] = new Image();
cardImages[52].src = '../Resources/Cards/SVG/card_back.svg';

var chipImages = [];
chipImages[7] = new Image();

const playerCardPos = [{x:-725, y:0},{x:-370, y:370},{x:0, y:370},{x:370, y:370},{x:725, y:0}];
const suit2Name = {0: 'spades', 1: 'clubs', 2: 'hearts', 3: 'diamonds', 4: 'joker'};
const num2Name = {1: 'ace', 11: 'jack', 12: 'queen', 13: 'king'};
function getCardImage(suit, num) {
    const cardId = num + suit * 13;
    if (!cardImages[cardId]) {
        cardImages[cardId] = new Image();
        cardImages[cardId].src = '../Resources/Cards/SVG/' + (num2Name.hasOwnProperty(num+1) ? num2Name[num+1] : num+1) + '_of_' + suit2Name[suit] + '.svg';
        cardImages[cardId].addEventListener('load', draw);
    }
    return cardImages[cardId];
}

const chipValues = {100: "Black", 25: "Green", 10: "Blue", 5: "Red", 2.5: "Pink", 1: "White"}

function getChipImage(value)
{
    const chip = 0;
    switch(value){
        case 100: chip = 0; break;
        case 25: chip = 1; break;
        case 10: chip = 2; break;
        case 5: chip = 3; break;
        case 2.5: chip = 4; break;
        case 1: chip = 5; break;
        default: break;
    }
    if (!chipImages[value])
    {
        chipImages[chip] = new Image();
        chipImages[chip].src = '../Resources/Chips/chip' + (chipValues.hasOwnProperty(value)) + ".png";
    }
    return chipImages;
}

var dealer = [cardImages[52], cardImages[52], cardImages[52], cardImages[52], cardImages[52]];
var players = [null, null, null, null, null];

function cardSetup(data) {
    console.log(data);
    console.log('TEST');
    for (let i = 0; i < 5; i++) {
        if (data.dealer[i]) {
            console.log('TEST1');
            dealer[i] = getCardImage(data.dealer[i].suit, data.dealer[i].number - 1);
        }
        else {
            console.log('TEST2');
            dealer[i] = cardImages[52];
        }
    }
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i]) {
            players[i] = data.players[i];
        }
    }
    draw();
}

function drawChips(pos, chipnum)
{
    const size = (chipnum.player ? cPlySize : cOtherSize);
    const mult = (chipnum.overlap ? 0.5 : 1.2);
    const offset = mult * 0.5 * (chipnum.hand.length - 1);
    ctx.drawImage(chipnumm.hand[i], pos.x + size.w * (i*mult - offset - 0.5), pos.y + size.h * -0.5, size.w, size.h);
}

function drawCards(pos, cards) {
    const size = (cards.player ? cPlySize : cOtherSize);
    const mult = (cards.overlap ? 0.5 : 1.2);
    if (!cards.hasOwnProperty('hand')) {
        cards.hand = [cardImages[52], cardImages[52]];
    }
    const offset = mult * 0.5 * (cards.hand.length - 1);
    for (let i = 0; i < cards.hand.length; i++) {
        ctx.drawImage(cards.hand[i], pos.x + size.w * (i*mult - offset - 0.5), pos.y + size.h * -0.5, size.w, size.h);
    }
}

function draw() {
    // Clear
    ctx.clearRect(c.width*-0.5, c.height*-0.5, c.width, c.height);

    // Table
    ctx.drawImage(cardTable, -1200*0.5, -600*0.5, 1200, 600);

    // Guide Lines
    ctx.beginPath();
    ctx.moveTo(0, -450);
    ctx.lineTo(0, 450);
    ctx.moveTo(-750, 0);
    ctx.lineTo(750, 0);
    ctx.stroke();

    // Dealer
    drawCards({x:0, y:0}, {player: true, overlap: false, hand: dealer});
    drawChips({x:0, y:0}, 1)
    updateTurn();
    // Players
    for (let i = 0; i < players.length; i++) {
        if (players[i] && players[i].uid) {
            var cardData = {player: false, overlap: true};
            if (players[i].hasOwnProperty('hand')) {
                cardData.player = true;
                cardData.overlap = false;
                cardData.hand = [];
                for (let j = 0; j < players[i].hand.length; j++) {
                    cardData.hand.push(getCardImage(players[i].hand[j].suit, players[i].hand[j].number - 1));
                }
            }
            drawCards(playerCardPos[i], cardData);
            ctx.fillText('£' + players[i].money, playerCardPos[i].x , playerCardPos[i].y - cPlySize.h * 0.6);

            ctx.fillText(players[i].name, playerCardPos[i].x , playerCardPos[i].y + cPlySize.h * 0.7);

        }
    }
}

var playersTurn = 0;
function updateTurn()
{
    
    var grd = ctx.createRadialGradient(playerCardPos[0].x, playerCardPos[0].y, 5, playerCardPos[0].x, playerCardPos[0].y, 70);
    grd.addColorStop(0, 'rgba(252,255,215,1)');
    grd.addColorStop(1, 'rgba(1,1,1,0.1)');
    ctx.fillStyle = grd;
    ctx.fillRect(playerCardPos[0].x - 75 ,playerCardPos[0].y - 75 , 150 , 150);
    ctx.fillStyle = 'white';
    if (playersTurn == 0)
    {
        
        // Fill with gradient
    }
}

function cardLoad() {
    c = document.getElementById('GameTable');
    ctx = c.getContext('2d');
    ctx.translate(c.width * 0.5, c.height * 0.5);

    ctx.fillStyle = 'white';
    ctx.font = '24px Open Sans';
    ctx.textAlign = 'center';
    
    //socket.emit('page_setup', { page: PAGE.GAME });
    //socket.on('card_setup', cardSetup);

    draw();
}

// function chipLoad()
// {
//     c = document.getElementById('GameTable');
//     ctx = c.getContext('2d');
//     ctx.translate(c.width * 0.5, c.height * 0.5);

//     ctx.fillStyle = 'white';
//     ctx.font = '24px Open Sans';
//     ctx.textAlign = 'center';

//     draw();
// }

window.addEventListener('load', cardLoad); 
//window.addEventListener('load', chipLoad);