loginRedirect = true;
var c, ctx;

const cPlyScale = 0.4, cOtherScale = 0.35
const cPlySize = { w: 223 * cPlyScale, h: 324 * cPlyScale }, cOtherSize = { w: 223 * cOtherScale, h: 324 * cOtherScale };

var cardTable = new Image();
cardTable.src = './Resources/pokertable.png';

var cardImages = [];
cardImages[52] = new Image();
cardImages[52].src = './Resources/Cards/SVG/card_back.svg';

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

var pot = 0;
var blind = 0;
var dealer = [cardImages[52], cardImages[52], cardImages[52], cardImages[52], cardImages[52]];
var players = [null, null, null, null, null];

var lastLi = null;
function recieveMessage(data) {
    var lastAction = document.getElementById('LastAction');
    var li = document.createElement('li');
    li.innerHTML = data.message;
    if (lastLi) {
        lastAction.insertBefore(li, lastAction.childNodes[0]);
    }
    else {
        lastAction.appendChild(li);
    }
    lastLi = li;
}

function cardSetup(data) {
    pot = data.pot;
    blind = data.blind;
    console.log(data);

    document.getElementById('nextBtn').style.display = (data.restart ? 'block' : 'none');

    if (data.players[data.pid].state == pState.PLAY && !data.restart)
    {
        var btns = document.getElementsByClassName('PlayerButtons');
        for (let i = 0; i < btns.length; i++) {
            const element = btns[i];
            element.disabled = false;
            element.className = 'PlayerButtons';
        }
    }
    else
    {
        var btns = document.getElementsByClassName('PlayerButtons');
        for (let i = 0; i < btns.length; i++) {
            const element = btns[i];
            element.disabled = true;
            element.className = 'PlayerButtons disabled';
        }
    }
        

    for (let i = 0; i < dealer.length; i++) {
        if (data.dealer[i]) {
            dealer[i] = getCardImage(data.dealer[i].suit, data.dealer[i].number - 1);
        }
        else {
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

    // Dealer
    drawCards({x:0, y:0}, {player: true, overlap: false, hand: dealer});

    ctx.fillStyle = 'black';
    ctx.font = '800 32px Open Sans';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 6;
    ctx.textAlign = 'center';
    ctx.strokeText('Pot: £' + pot,  0 , 100);
    
    ctx.fillText('Pot: £' + pot,  0 , 100);
    
    ctx.strokeText('Current Blind: ' + blind,  0 , 140);
    
    ctx.fillText('Current Blind: ' + blind,  0 , 140);


    ctx.fillStyle = 'white';
    ctx.font = '24px Open Sans';

    // Players
    for (let i = 0; i < players.length; i++) {
        if (players[i] && players[i].uid) {
            if (players[i].state == pState.PLAY || players[i].state == pState.STANDBY) updateTurn(players[i], i);
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
            if (players[i].state == pState.FOLD) updateTurn(players[i], i);

        }
    }
}

var playersTurn = 1;
function updateTurn(selectedPlayer, posIndex)
{
    var pTurnState = selectedPlayer.state;
    if (pTurnState == pState.PLAY)
    {
        var grd = ctx.createRadialGradient(playerCardPos[posIndex].x, playerCardPos[posIndex].y, 20, playerCardPos[posIndex].x, playerCardPos[posIndex].y, 150);
        grd.addColorStop(0, 'rgba(252,255,215,0.9)');
        grd.addColorStop(1, 'rgba(0,0,0,0.1)');
        ctx.fillStyle = grd;
        ctx.fillRect(playerCardPos[posIndex].x - 150 ,playerCardPos[posIndex].y - 150 , 300 , 300);
        ctx.fillStyle = 'white';
    }
    else if (pTurnState == pState.FOLD)
    {

        ctx.fillStyle = 'black';
        ctx.font = '800 32px Open Sans';

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 8;
        ctx.strokeText('FOLDED!',  playerCardPos[posIndex].x , playerCardPos[posIndex].y);
        
        ctx.textAlign = 'center';
        ctx.fillText('FOLDED!', playerCardPos[posIndex].x , playerCardPos[posIndex].y);
        ctx.fillStyle = 'white';
        ctx.font = '24px Open Sans';
        
        /*for (let i = 0; i < data.dealer.length; i++) {
            if (data.dealer[i]) {
                dealer[i] = getCardImage(data.dealer[i].suit, data.dealer[i].number - 1);
            }
        }*/
    }
}

function betResult(data) {
    console.log(data);
}

function raiseResult(data) {
    console.log(data);
}

function foldResult(data) {
    console.log(data);
}

function cardLoad() {
    document.getElementById('betBtn').addEventListener('click', function() { socket.emit('player_bet', {}); });
    document.getElementById('raiseBtn').addEventListener('click', function() { socket.emit('player_raise', {}); });
    document.getElementById('foldBtn').addEventListener('click', function() { socket.emit('player_fold', {}); });
    document.getElementById('nextBtn').addEventListener('click', function() { socket.emit('round_next', {}); });

    c = document.getElementById('GameTable');
    ctx = c.getContext('2d');
    ctx.translate(c.width * 0.5, c.height * 0.5);

    ctx.fillStyle = 'white';
    ctx.font = '24px Open Sans';
    ctx.textAlign = 'center';
    
    socket.emit('page_setup', { page: PAGE.GAME });
    socket.on('card_setup', cardSetup);
    socket.on('broadcast_message', recieveMessage);

    socket.on('bet_result', betResult);
    socket.on('raise_result', raiseResult);
    socket.on('fold_result', foldResult);

    draw();
}
window.addEventListener('load', cardLoad); 