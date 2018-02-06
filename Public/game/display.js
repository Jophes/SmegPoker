var c, ctx;

const cPlyScale = 0.4, cOtherScale = 0.35
const cPlySize = { w: 223 * cPlyScale, h: 324 * cPlyScale }, cOtherSize = { w: 223 * cOtherScale, h: 324 * cOtherScale };

var cardTable = new Image();
cardTable.src = '../Resources/pokertable.png';
var cardBack = new Image();
cardBack.src = '../Resources/Cards/SVG/card_back.svg';
var cardA = new Image();
cardA.src = '../Resources/Cards/SVG/2_of_clubs.svg';
var cardB = new Image();
cardB.src = '../Resources/Cards/SVG/8_of_spades.svg';
var cardC = new Image();
cardC.src = '../Resources/Cards/SVG/10_of_hearts.svg';
var dealer = [cardA, cardB, cardC, cardBack, cardBack];

function displayLoad() {
    c = document.getElementById('GameTable');
    ctx = c.getContext('2d');

    function drawCards(pos, cards) {
        const size = (cards.player ? cPlySize : cOtherSize);
        const mult = (cards.overlap ? 0.5 : 1.2);
        if (!cards.hasOwnProperty('hand')) {
            cards.hand = [cardBack, cardBack];
        }
        const offset = mult * 0.5 * (cards.hand.length - 1);
        for (let i = 0; i < cards.hand.length; i++) {
            ctx.drawImage(cards.hand[i], pos.x + size.w * (i*mult - offset - 0.5), pos.y + size.h * -0.5, size.w, size.h);
        }
    }

    // Table
    ctx.drawImage(cardTable, c.width*0.5 - 1200*0.5, c.height*0.5 - 600*0.5, 1200, 600);

    // Guide Lijnes
    ctx.translate(c.width * 0.5, c.height * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, -450);
    ctx.lineTo(0, 450);
    ctx.moveTo(-750, 0);
    ctx.lineTo(750, 0);
    ctx.stroke();

    // Dealer
    drawCards({x:0, y:0}, {player: true, overlap: false, hand: dealer});

    // Players
    drawCards({x:-725, y:0}, {player: false, overlap: true});
    drawCards({x:-370, y:370}, {player: false, overlap: true});
    drawCards({x:0, y:370}, {player: true, overlap: false, hand: [cardB, cardC]});
    drawCards({x:370, y:370}, {player: false, overlap: true});
    drawCards({x:725, y:0}, {player: false, overlap: true});
}
window.addEventListener('load', displayLoad);