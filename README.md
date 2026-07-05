# Tic-Tac-Toe — Human vs Unbeatable AI

A single-file, zero-dependency game of tic-tac-toe. **You** play `X`, the **AI** plays `O`.

Just open `index.html` in any browser — nothing to install.

## Why it's flawless

- **The AI cannot lose.** It uses the [minimax algorithm](https://en.wikipedia.org/wiki/Minimax) to
  search the entire game tree and always plays a perfect move. Against perfect play, the best a
  human can do is force a draw.
- **No glitches across unlimited rounds.** Every illegal action is blocked: you can't click a filled
  square, can't move while the AI is thinking, and can't move after the game ends. "New Round" fully
  resets the board every time.

## Proof, not promises

Two automated tests back the claims (require Node.js; the browser test also needs Playwright):

```bash
node verify.js     # exhaustively plays EVERY possible game line
node ui-test.js    # drives the real UI in a browser for 200 rounds
```

`verify.js` explores all 569 reachable end states and confirms:

```
AI wins:     386
Draws:       183
Human wins:  0        <-- the AI never loses
Illegal states detected: 0
```

`ui-test.js` plays 200 random rounds in a real browser and confirms 0 human wins,
0 glitches, 0 page errors, and a clean reset every round.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The complete game (HTML + CSS + JS, self-contained) |
| `verify.js`  | Exhaustive game-tree correctness proof |
| `ui-test.js` | 200-round browser integration test |
