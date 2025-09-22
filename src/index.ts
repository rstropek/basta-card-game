import './index.css';

type Suit = 'Clubs' | 'Diamonds' | 'Hearts' | 'Spades';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'jack' | 'queen' | 'king' | 'ace';

interface Card {
    suit: Suit;
    rank: Rank;
}

type Phase = 'dealing' | 'betting' | 'playerTurn' | 'dealerTurn' | 'showdown' | 'gameOver';

interface GameState {
    deck: Card[];
    playerHand: Card[];
    dealerHand: Card[];
    playerPoints: number;
    targetWinPoints: number;
    currentBet: number;
    pot: number;
    phase: Phase;
    message: string;
    lastOutcome: 'win' | 'lose' | 'push' | null;
}

const SUITS: Suit[] = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];

const app = document.getElementById('app') as HTMLDivElement;

function createInitialState(): GameState {
    return {
        deck: [],
        playerHand: [],
        dealerHand: [],
        playerPoints: 20,
        targetWinPoints: 40,
        currentBet: 0,
        pot: 0,
        phase: 'dealing',
        message: '',
        lastOutcome: null,
    };
}

let state: GameState = createInitialState();

function buildDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ suit, rank });
        }
    }
    return shuffle(deck);
}

function shuffle<T>(array: T[]): T[] {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function drawCard(): Card {
    if (state.deck.length === 0) {
        state.deck = buildDeck();
    }
    return state.deck.shift() as Card;
}

function cardValue(rank: Rank): number {
    if (rank === 'ace') return 11; // handle soft/hard in handValue
    if (rank === 'king' || rank === 'queen' || rank === 'jack') return 10;
    return parseInt(rank, 10);
}

function handValue(hand: Card[]): { total: number; isSoft: boolean } {
    let total = 0;
    let aces = 0;
    for (const c of hand) {
        if (c.rank === 'ace') {
            aces += 1;
        }
        total += cardValue(c.rank);
    }
    let isSoft = false;
    while (total > 21 && aces > 0) {
        total -= 10; // count one Ace as 1 instead of 11
        aces -= 1;
    }
    // If any ace still counted as 11 and total <= 21, it's a soft hand
    if (hand.some(c => c.rank === 'ace') && total <= 21) {
        // recompute whether soft: if total + 10 would bust, it's hard; else soft
        const base = hand.reduce((s, c) => s + (c.rank === 'ace' ? 1 : cardValue(c.rank)), 0);
        if (base + 10 === total) {
            isSoft = true;
        }
    }
    return { total, isSoft };
}

function getCardImagePath(card: Card): string {
    const suitDir = card.suit; // directory is capitalized plural
    const fileSuit = card.suit.toLowerCase();
    const fileName = `${card.rank} ${fileSuit}.svg`;
    return `/${suitDir}/${fileName}`;
}

function setupLayout() {
    app.innerHTML = `
        <div class="app">
            <header class="topbar">
                <div class="title">Pontoon</div>
                <div class="stats">
                    <div>Points: <span id="points">0</span></div>
                    <div>Pot: <span id="pot">0</span></div>
                    <div>Goal: <span id="goal">${state.targetWinPoints}</span></div>
                </div>
            </header>
            <main class="table">
                <section class="side dealer">
                    <h2>Computer</h2>
                    <div class="hand" id="dealer-hand"></div>
                    <div class="value" id="dealer-value"></div>
                </section>
                <section class="side player">
                    <h2>You</h2>
                    <div class="hand" id="player-hand"></div>
                    <div class="value" id="player-value"></div>
                </section>
            </main>
            <section class="controls">
                <div class="betting">
                    <label for="bet-input">Bet</label>
                    <input type="number" id="bet-input" min="1" step="1" />
                    <button id="place-bet">Place bet</button>
                </div>
                <div class="actions">
                    <button id="hit">Hit</button>
                    <button id="stand">Stand</button>
                    <button id="next-round">Next round</button>
                    <button id="restart">Restart</button>
                </div>
                <div class="message" id="message"></div>
            </section>
        </div>
    `;

    const placeBetBtn = document.getElementById('place-bet') as HTMLButtonElement;
    placeBetBtn.addEventListener('click', () => {
        const input = document.getElementById('bet-input') as HTMLInputElement;
        const amount = Math.floor(Number(input.value));
        placeBet(amount);
    });
    (document.getElementById('hit') as HTMLButtonElement).addEventListener('click', hit);
    (document.getElementById('stand') as HTMLButtonElement).addEventListener('click', stand);
    (document.getElementById('next-round') as HTMLButtonElement).addEventListener('click', nextRound);
    (document.getElementById('restart') as HTMLButtonElement).addEventListener('click', restartGame);
}

function startRound() {
    state.deck = buildDeck();
    state.playerHand = [drawCard(), drawCard()];
    state.dealerHand = [drawCard(), drawCard()];
    state.currentBet = 0;
    state.pot = 0;
    state.message = 'Place your bet after seeing your first two cards.';
    state.phase = 'betting';
    state.lastOutcome = null;
    render();
}

function placeBet(amount: number) {
    if (state.phase !== 'betting') return;
    if (!Number.isFinite(amount) || amount < 1) {
        state.message = 'Enter a valid bet (min 1).';
        render();
        return;
    }
    if (amount > state.playerPoints) {
        state.message = `You cannot bet more than your points (${state.playerPoints}).`;
        render();
        return;
    }
    state.currentBet = amount;
    state.playerPoints -= amount; // player stakes
    state.pot = amount * 2; // computer auto-matches and holds
    state.phase = 'playerTurn';
    state.message = 'Hit or Stand.';
    render();
}

function hit() {
    if (state.phase !== 'playerTurn') return;
    state.playerHand.push(drawCard());
    const { total } = handValue(state.playerHand);
    if (total > 21) {
        // Player busts, but dealer MUST still draw to >= 16
        state.phase = 'dealerTurn';
        state.message = 'You busted. Dealer is drawing...';
        dealerPlay();
        return;
    }
    render();
}

function stand() {
    if (state.phase !== 'playerTurn') return;
    state.phase = 'dealerTurn';
    dealerPlay();
}

function dealerPlay() {
    // Player cannot see dealer cards; draw in the background until >=16 or bust
    while (true) {
        const { total } = handValue(state.dealerHand);
        if (total >= 16) break;
        state.dealerHand.push(drawCard());
        // Avoid infinite loops in pathological decks
        if (state.dealerHand.length > 10) break;
    }
    resolveRound();
}

function resolveRound() {
    const player = handValue(state.playerHand).total;
    const dealer = handValue(state.dealerHand).total;
    let msg = '';
    if (player > 21 && dealer > 21) {
        state.lastOutcome = 'push';
        state.playerPoints += state.currentBet; // both busted, bets returned
        msg = 'Both busted. Bets returned.';
    } else if (player > 21) {
        state.lastOutcome = 'lose';
        msg = 'You busted. Dealer wins.';
    } else if (dealer > 21) {
        state.lastOutcome = 'win';
        state.playerPoints += state.pot; // you take the pot
        msg = 'Dealer busted. You win the pot!';
    } else if (player > dealer) {
        state.lastOutcome = 'win';
        state.playerPoints += state.pot; // you take the pot
        msg = 'You have the higher hand. You win the pot!';
    } else if (player < dealer) {
        state.lastOutcome = 'lose';
        msg = 'Dealer has the higher hand. You lose.';
    } else {
        state.lastOutcome = 'push';
        state.playerPoints += state.currentBet; // return stake on push
        msg = 'Push. Your bet is returned.';
    }
    state.phase = 'showdown';
    state.message = `${msg} (You: ${player}, Dealer: ${dealer})`;

    if (state.playerPoints <= 0) {
        state.phase = 'gameOver';
        state.message = 'You are out of points. Game over.';
    } else if (state.playerPoints >= state.targetWinPoints) {
        state.phase = 'gameOver';
        state.message = `You reached ${state.playerPoints} points. You win!`;
    }
    render();
}

function nextRound() {
    if (state.phase !== 'showdown') return;
    startRound();
}

function restartGame() {
    state = createInitialState();
    setupLayout();
    startRound();
}

function renderHand(container: HTMLElement, hand: Card[], reveal: boolean) {
    container.innerHTML = '';
    hand.forEach((card, index) => {
        if (reveal) {
            const img = document.createElement('img');
            img.src = getCardImagePath(card);
            img.alt = `${card.rank} of ${card.suit}`;
            img.className = 'card-img';
            const wrapper = document.createElement('div');
            wrapper.className = 'card';
            wrapper.appendChild(img);
            container.appendChild(wrapper);
        } else {
            const back = document.createElement('div');
            back.className = 'card card-back';
            back.setAttribute('aria-label', index === 0 ? 'Hidden card' : 'Hidden card');
            container.appendChild(back);
        }
    });
}

function render() {
    // Stats
    (document.getElementById('points') as HTMLElement).textContent = String(state.playerPoints);
    (document.getElementById('pot') as HTMLElement).textContent = String(state.pot);

    const playerVal = handValue(state.playerHand);
    (document.getElementById('player-value') as HTMLElement).textContent = `Total: ${playerVal.total}${playerVal.isSoft ? ' (soft)' : ''}`;

    // Dealer value hidden until showdown / gameOver
    const dealerValueEl = document.getElementById('dealer-value') as HTMLElement;
    if (state.phase === 'showdown' || state.phase === 'gameOver') {
        const dv = handValue(state.dealerHand);
        dealerValueEl.textContent = `Total: ${dv.total}${dv.isSoft ? ' (soft)' : ''}`;
    } else {
        dealerValueEl.textContent = 'Hidden';
    }

    // Hands
    const playerHandEl = document.getElementById('player-hand') as HTMLElement;
    const dealerHandEl = document.getElementById('dealer-hand') as HTMLElement;
    renderHand(playerHandEl, state.playerHand, true);
    renderHand(dealerHandEl, state.dealerHand, state.phase === 'showdown' || state.phase === 'gameOver');

    // Controls
    const betInput = document.getElementById('bet-input') as HTMLInputElement;
    const placeBetBtn = document.getElementById('place-bet') as HTMLButtonElement;
    const hitBtn = document.getElementById('hit') as HTMLButtonElement;
    const standBtn = document.getElementById('stand') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-round') as HTMLButtonElement;
    const restartBtn = document.getElementById('restart') as HTMLButtonElement;

    betInput.max = String(state.playerPoints);
    betInput.value = state.currentBet ? String(state.currentBet) : Math.min(5, state.playerPoints).toString();

    placeBetBtn.disabled = state.phase !== 'betting' || state.playerPoints <= 0;
    hitBtn.disabled = state.phase !== 'playerTurn';
    standBtn.disabled = state.phase !== 'playerTurn';
    nextBtn.disabled = state.phase !== 'showdown';
    restartBtn.disabled = false;

    (document.getElementById('message') as HTMLElement).textContent = state.message;
}

// Initialize
setupLayout();
startRound();

