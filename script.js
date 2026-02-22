const SIZE = 10;
const MINES = 14;

const boardEl = document.getElementById("board");
const mineCounterEl = document.getElementById("mine-counter");
const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("status");
const newGameBtn = document.getElementById("new-game");

let board = [];
let revealedCount = 0;
let flaggedCount = 0;
let started = false;
let gameOver = false;
let timer = 0;
let timerId;

function createCell(row, col) {
  return {
    row,
    col,
    isMine: false,
    revealed: false,
    flagged: false,
    count: 0,
  };
}

function neighbors(row, col) {
  const result = [];
  for (let r = row - 1; r <= row + 1; r += 1) {
    for (let c = col - 1; c <= col + 1; c += 1) {
      if (r === row && c === col) continue;
      if (r < 0 || c < 0 || r >= SIZE || c >= SIZE) continue;
      result.push([r, c]);
    }
  }
  return result;
}

function placeMines(firstRow, firstCol) {
  let placed = 0;
  while (placed < MINES) {
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);
    if ((row === firstRow && col === firstCol) || board[row][col].isMine) continue;
    board[row][col].isMine = true;
    placed += 1;
  }

  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      board[r][c].count = neighbors(r, c).filter(([nr, nc]) => board[nr][nc].isMine).length;
    }
  }
}

function render() {
  boardEl.innerHTML = "";
  boardEl.style.setProperty("--size", SIZE);

  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      const cell = board[r][c];
      const button = document.createElement("button");
      button.className = "cell";
      button.dataset.row = r;
      button.dataset.col = c;

      if (cell.revealed) {
        button.classList.add("revealed");
        if (cell.isMine) {
          button.classList.add("mine");
          button.textContent = "💣";
        } else if (cell.count > 0) {
          button.textContent = String(cell.count);
          button.classList.add(`n${cell.count}`);
        }
      } else if (cell.flagged) {
        button.classList.add("flagged");
      }

      boardEl.appendChild(button);
    }
  }

  mineCounterEl.textContent = String(MINES - flaggedCount);
}

function floodReveal(startCell) {
  const stack = [startCell];

  while (stack.length) {
    const cell = stack.pop();
    if (!cell || cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    revealedCount += 1;

    if (cell.count === 0) {
      neighbors(cell.row, cell.col).forEach(([nr, nc]) => {
        const neighbor = board[nr][nc];
        if (!neighbor.revealed && !neighbor.isMine) stack.push(neighbor);
      });
    }
  }
}

function revealAllMines() {
  for (const row of board) {
    for (const cell of row) {
      if (cell.isMine) cell.revealed = true;
    }
  }
}

function stopTimer() {
  clearInterval(timerId);
}

function startTimer() {
  stopTimer();
  timerId = setInterval(() => {
    timer += 1;
    timerEl.textContent = String(timer);
  }, 1000);
}

function checkWin() {
  if (revealedCount === SIZE * SIZE - MINES && !gameOver) {
    gameOver = true;
    statusEl.textContent = "¡Victoria!";
    stopTimer();
  }
}

function revealCell(row, col) {
  if (gameOver) return;
  const cell = board[row][col];
  if (cell.revealed || cell.flagged) return;

  if (!started) {
    placeMines(row, col);
    started = true;
    startTimer();
  }

  if (cell.isMine) {
    cell.revealed = true;
    revealAllMines();
    gameOver = true;
    statusEl.textContent = "Explosión 💥";
    stopTimer();
    render();
    return;
  }

  floodReveal(cell);
  checkWin();
  render();
}

function toggleFlag(row, col) {
  if (gameOver) return;
  const cell = board[row][col];
  if (cell.revealed) return;
  cell.flagged = !cell.flagged;
  flaggedCount += cell.flagged ? 1 : -1;
  render();
}

function setupBoard() {
  board = Array.from({ length: SIZE }, (_, row) => Array.from({ length: SIZE }, (_, col) => createCell(row, col)));
  revealedCount = 0;
  flaggedCount = 0;
  started = false;
  gameOver = false;
  timer = 0;
  timerEl.textContent = "0";
  statusEl.textContent = "Jugando";
  stopTimer();
  render();
}

boardEl.addEventListener("click", (event) => {
  const target = event.target.closest(".cell");
  if (!target) return;
  revealCell(Number(target.dataset.row), Number(target.dataset.col));
});

boardEl.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const target = event.target.closest(".cell");
  if (!target) return;
  toggleFlag(Number(target.dataset.row), Number(target.dataset.col));
});

newGameBtn.addEventListener("click", setupBoard);

setupBoard();
