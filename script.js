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
const popup = document.getElementById('popup');
const popupContent = document.getElementById('popupContent');
const matchCount = document.getElementById('matchCount');
const timerDisplay = document.getElementById('timer');

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
    dot.addEventListener('click', handleClick);
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
    popupTimer = setTimeout(() => hidePopup(), 4000);
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

// Initialize
document.documentElement.style.setProperty('--dot-color', gameSettings.dotColor);
generateMatches(gameSettings.dotCount);
createBoard();
// startTimer(); // moved to first click
