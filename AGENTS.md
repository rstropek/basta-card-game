# Pontoon Game - Agent Documentation

## Tech Stack

### Frontend

- HTML5
- TypeScript
- CSS
- Vite

## Folder Structure

```
/
├── index.html          # Main HTML entry point
├── package.json        # Project dependencies and scripts
├── package-lock.json   # Locked dependency versions
├── node_modules/       # npm dependencies
├── public/             # Static assets (card images)
│   ├── Clubs/          # Club suit cards (2-10, j, q, k, ace)
│   ├── Diamonds/       # Diamond suit cards
│   ├── Hearts/         # Heart suit cards
│   └── Spades/         # Spade suit cards
└── src/                # Source code
    ├── index.ts        # Main game logic and UI
    └── index.css       # Styling and responsive design
```

### Asset Organization

- **Card Images**: Each suit has its own directory
- **Naming Convention**: `{rank} {suit}.svg` (e.g., "ace hearts.svg", "10 clubs.svg")
- **SVG Format**
- **Accessibility**: Alt text includes full card description

## Detailed Game Rules

### Game Overview

Pontoon (also known as Twenty-One or Blackjack) is a card game where players compete against a computer dealer to get as close to 21 as possible without going over.

### Objective

- **Win Condition**: Reach 40+ points
- **Lose Condition**: Reach 0 points
- **Starting Points**: 20 points

### Card Values

- **Number Cards (2-10)**: Face value
- **Face Cards (Jack, Queen, King)**: 10 points each
- **Ace**: 11 points (soft) or 1 point (hard)
  - Automatically adjusts to prevent busting
  - "Soft" hand: Ace counted as 11 without busting
  - "Hard" hand: Ace counted as 1 to avoid busting

### Game Flow

#### 1. Initial Deal

- Both player and computer receive 2 cards
- Player cards are face up, computer cards are face down
- Player must place a bet after seeing their initial hand

#### 2. Betting Phase

- Player enters bet amount (minimum 1 point)
- Cannot bet more than current points
- Computer automatically matches the bet and holds the pot
- Total pot = Player bet × 2

#### 3. Player Turn

- **Hit**: Draw another card
- **Stand**: Keep current hand
- **Bust**: Hand value exceeds 21 (automatic loss)

#### 4. Computer Turn

- **Mandatory Rule**: Computer MUST draw until hand value ≥ 16
- Computer draws cards even if player has already busted
- Computer cards remain hidden until showdown

#### 5. Showdown

- Both hands are revealed
- Hand values are compared
- Winner determined by highest value ≤ 21

### Win/Loss Conditions

#### Player Wins

- Player has higher hand value than computer (both ≤ 21)
- Computer busts (hand value > 21)
- **Reward**: Player receives the entire pot

#### Computer Wins

- Computer has higher hand value than player (both ≤ 21)
- Player busts (hand value > 21)
- **Result**: Player loses their bet

#### Push (Tie)

- Both hands have the same value ≤ 21
- Both hands bust (> 21)
- **Result**: Player's bet is returned (no gain/loss)

### Special Rules

#### Dealer Drawing Rule

- **Critical**: Computer MUST draw until hand value ≥ 16
- This rule applies even if player has already busted

#### Betting Constraints
- Minimum bet: 1 point
- Maximum bet: Current player points
- Computer always matches player bet exactly

### UI/UX Features

#### Responsive Design
- **Game Controls** in the bottom left corner
- **Game Stats** in the upper right corner
- **Portrait Mode**: Single column layout, stacked sections
- **Landscape Mode**: Two-column layout for optimal space usage
- **Mobile Friendly**: Touch-friendly buttons and appropriate sizing

### Technical Implementation

#### State Management
- Centralized game state object
- Phase-based game flow control
- Immutable state updates

#### Card System
- 52-card deck (4 suits × 13 ranks)
- Automatic deck reshuffling when empty
- Proper card value calculations

### Development Commands
```bash
npm start      # Start development server
npm install    # Install dependencies
```
