var c, ctx;

const cPlyScale = 0.4, cOtherScale = 0.35
const cPlySize = { w: 223 * cPlyScale, h: 324 * cPlyScale }, cOtherSize = { w: 223 * cOtherScale, h: 324 * cOtherScale };

var cardTable = new Image();
cardTable.src = '../Resources/pokertable.png';

var cardImages = [];
cardImages[52] = new Image();
cardImages[52].src = '../Resources/Cards/SVG/card_back.svg';

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

var dealer = [cardImages[52], cardImages[52], cardImages[52], cardImages[52], cardImages[52]];
var players = [null, null, null, null, null];

function cardSetup(data) {
    console.log(data);
    for (let i = 0; i < data.dealer.length; i++) {
        if (data.dealer[i]) {
            dealer[i] = getCardImage(data.dealer[i].suit, data.dealer[i].number - 1);
        }
    }
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i]) {
            players[i] = data.players[i];
        }
    }
    draw();
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

    // Players
    for (let i = 0; i < players.length; i++) {
        if (players[i] && players[i].uid) {
            drawCards(playerCardPos[i], {player: false, overlap: true});
            
            ctx.fillText('Hello world', playerCardPos[i].x , playerCardPos[i].y);
            
        }
    }
}

function cardLoad() {
    c = document.getElementById('GameTable');
    ctx = c.getContext('2d');
    ctx.translate(c.width * 0.5, c.height * 0.5);

    ctx.fillStyle = 'white';
    ctx.font = "30px Open Sans";
    // Clear
    ctx.clearRect(-c.width*0.5, -c.height*0.5, c.width*0.5, c.height*0.5);

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

    // Players
    for (let i = 0; i < players.length; i++) {
        if (players[i] && players[i].uid) {
            drawCards(playerCardPos[i], {player: false, overlap: true});
        }
    }

    socket.emit('page_setup', { page: PAGE.GAME });
    socket.on('card_setup', cardSetup);
}
window.addEventListener('load', cardLoad); 