// Drives the real game in Chromium across many rounds, playing random legal
// human moves. Asserts: no page errors, AI never loses, board never enters an
// illegal state, and "New Round" always resets cleanly.
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage();

  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('console', msg => { if (msg.type() === 'error') pageErrors.push(msg.text()); });

  await page.goto('file://' + path.join(__dirname, 'index.html'));

  const ROUNDS = 200;
  let humanWins = 0, aiWins = 0, draws = 0, illegal = 0;

  const readBoard = () => page.$$eval('.cell', cells => cells.map(c => c.textContent.trim()));
  const statusText = () => page.$eval('#status', el => el.textContent.trim());

  for (let r = 0; r < ROUNDS; r++) {
    // Play until the round ends.
    for (let step = 0; step < 9; step++) {
      const status = await statusText();
      if (/win|draw/i.test(status)) break;
      // Only click when it's the human's turn (board not locked).
      const locked = await page.$eval('#board', b => b.classList.contains('locked'));
      if (locked) { await page.waitForTimeout(60); continue; }

      const b = await readBoard();
      const empty = b.map((v, i) => v === '' ? i : -1).filter(i => i >= 0);
      if (empty.length === 0) break;

      // Try clicking a FILLED cell too, to confirm it is ignored.
      const filled = b.map((v, i) => v !== '' ? i : -1).filter(i => i >= 0);
      if (filled.length) {
        const before = await readBoard();
        await page.click(`.cell[data-index="${filled[0]}"]`);
        const after = await readBoard();
        if (JSON.stringify(before) !== JSON.stringify(after)) illegal++;
      }

      const pick = empty[Math.floor(Math.random() * empty.length)];
      await page.click(`.cell[data-index="${pick}"]`);
      await page.waitForTimeout(300); // let the AI respond
    }

    // Validate final board legality.
    const b = await readBoard();
    const x = b.filter(v => v === 'X').length;
    const o = b.filter(v => v === 'O').length;
    if (!(x === o || x === o + 1)) illegal++;

    const status = await statusText();
    if (/you win/i.test(status)) humanWins++;
    else if (/ai wins/i.test(status)) aiWins++;
    else if (/draw/i.test(status)) draws++;

    // New round + confirm clean reset.
    await page.click('#reset');
    await page.waitForTimeout(30);
    const reset = await readBoard();
    if (reset.some(v => v !== '')) illegal++;
  }

  await browser.close();

  console.log(`Rounds played:  ${ROUNDS}`);
  console.log(`  AI wins:    ${aiWins}`);
  console.log(`  Draws:      ${draws}`);
  console.log(`  Human wins: ${humanWins}`);
  console.log(`Illegal/glitch events: ${illegal}`);
  console.log(`Page errors: ${pageErrors.length}`);
  if (pageErrors.length) console.log(pageErrors.slice(0, 5));

  if (humanWins === 0 && illegal === 0 && pageErrors.length === 0) {
    console.log('\nPASS: 200 rounds, no glitches, AI never lost.');
    process.exit(0);
  } else {
    console.log('\nFAIL');
    process.exit(1);
  }
})();
