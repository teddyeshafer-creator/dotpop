const gameSettings = {
  dotCount: 12,
  theme: 'dark',
  dotColor: '#00ff99',
  victoryText: '🎉 You matched them all!'
};

const symbols = ['🦁', '🐸', '🐵', '🐼', '🐷', '🐶', '🐱', '🐯', '🦊', '🐻', '🐨', '🐰'];
let matches = [];

function generateMatches(count) {
  const pairsNeeded = count / 2;
  if (pairsNeeded > symbols.length) {
    alert('Not enough unique symbols to generate matches.');
    return;
  }
  const selected = symbols.slice(0, pairsNeeded);
  matches = [...selected, ...selected];
}

const board = document.getElementById('board');
const victoryMessage = document.getElementById('victoryMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const popup = document.getElementById('popup');
const popupContent = document.getElementById('popupContent');
const matchCount = document.getElementById('matchCount');
const timerDisplay = document.getElementById('timer');
const bestTimeDisplay = document.getElementById('bestTime');

let firstPick = null;
let secondPick = null;
let matched = 0;
let popupTimer = null;
let postPopupAction = null;
let secondsElapsed = 0;
let timerInterval = null;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startTimer() {
  timerInterval = setInterval(() => {
    secondsElapsed++;
    timerDisplay.textContent = secondsElapsed;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function createBoard() {
  const shuffled = shuffle([...matches]);
  shuffled.forEach((symbol, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    dot.dataset.symbol = symbol;
    dot.dataset.index = index;
    dot.innerHTML = '?';
    dot.setAttribute('tabindex', '0');
    dot.setAttribute('role', 'button');
    dot.setAttribute('aria-label', `Card ${index + 1}`);
    dot.addEventListener('click', handleClick);
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick({ currentTarget: dot });
      }
    });
    board.appendChild(dot);
  });
}

function handleClick(e) {
  if (!timerInterval) startTimer();
  const dot = e.currentTarget;
  if (dot.classList.contains('revealed') || secondPick) return;

  dot.classList.add('revealed');
  dot.innerHTML = dot.dataset.symbol;
  showPopup(dot.dataset.symbol);

  if (!firstPick) {
    firstPick = dot;
  } else {
    secondPick = dot;
    if (firstPick.dataset.symbol === secondPick.dataset.symbol) {
      firstPick.classList.add('matched');
      secondPick.classList.add('matched');
      matched += 2;
      matchCount.textContent = matched / 2;
      if (matched === gameSettings.dotCount) {
        victoryMessage.textContent = gameSettings.victoryText;
        victoryMessage.classList.add('active');
        stopTimer();
        checkBestTime(secondsElapsed);
        playAgainBtn.classList.add('active');
      }
      postPopupAction = () => resetPicks();
    } else {
      postPopupAction = () => {
        firstPick.classList.remove('revealed');
        firstPick.innerHTML = '?';
        secondPick.classList.remove('revealed');
        secondPick.innerHTML = '?';
        resetPicks();
      };
    }
    clearTimeout(popupTimer);
    popupTimer = setTimeout(() => hidePopup(), 1000);
  }
}

function resetPicks() {
  firstPick = null;
  secondPick = null;
}

function showPopup(symbol) {
  popupContent.textContent = symbol;
  popup.classList.add('active');
}

function hidePopup() {
  popup.classList.remove('active');
  if (typeof postPopupAction === 'function') {
    postPopupAction();
    postPopupAction = null;
  }
}

function hidePopupEarly(userInitiated = false) {
  clearTimeout(popupTimer);
  hidePopup();
}

// Expose popup close handler for inline HTML button onclick.
window.hidePopupEarly = hidePopupEarly;

// Best time helpers
function getBestTime() {
  const val = localStorage.getItem('dotpop_bestTime');
  return val !== null ? parseInt(val, 10) : null;
}

function checkBestTime(time) {
  const best = getBestTime();
  if (best === null || time < best) {
    localStorage.setItem('dotpop_bestTime', time);
    updateBestTimeDisplay(time, true);
  } else {
    updateBestTimeDisplay(best, false);
  }
}

function updateBestTimeDisplay(time, isNew) {
  if (time === undefined || time === null) {
    const stored = getBestTime();
    if (stored === null) {
      bestTimeDisplay.textContent = 'Best: --';
      return;
    }
    time = stored;
    isNew = false;
  }
  bestTimeDisplay.textContent = isNew ? `Best: ${time}s 🏆` : `Best: ${time}s`;
}

// Play Again
function playAgain() {
  firstPick = null;
  secondPick = null;
  matched = 0;
  secondsElapsed = 0;
  clearInterval(timerInterval);
  timerInterval = null;
  clearTimeout(popupTimer);
  postPopupAction = null;

  timerDisplay.textContent = '0';
  matchCount.textContent = '0';
  victoryMessage.classList.remove('active');
  playAgainBtn.classList.remove('active');
  popup.classList.remove('active');

  board.innerHTML = '';
  generateMatches(gameSettings.dotCount);
  createBoard();
  updateBestTimeDisplay();
}

// Expose play again handler for inline HTML button onclick.
window.playAgain = playAgain;

// Initialize
document.documentElement.style.setProperty('--dot-color', gameSettings.dotColor);
generateMatches(gameSettings.dotCount);
createBoard();
updateBestTimeDisplay();
// startTimer(); // moved to first click
