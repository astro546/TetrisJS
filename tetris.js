//----------------------- Elementos de canvas --------------------
const tetrisBoard = document.querySelector('#tetris-board');
const holdCanvas = document.querySelector('#hold-canvas');
const nextCanvas = document.querySelector('.next-canvas');

// Elementos de puntuacion
const scoreElement = document.querySelector('#score');
const levelElement = document.querySelector('#level');
const linesElement = document.querySelector('#lines');

//----------------- Variables de la logica del juego --------------
let score = 0;
let level = 1;
let lines = 0;
let comboCounter = 0;
let gameOver = false;

// ----------------------- Bloques del Tetris ---------------------
const redBlock = document.querySelector('#red-block');
const orangeBlock = document.querySelector('#orange-block');
const greenBlock = document.querySelector('#green-block');
const blueBlock = document.querySelector('#blue-block');
const strongBlueBlock = document.querySelector('#strong-blue-block');
const purpleBlock = document.querySelector('#purple-block');
const yellowBlock = document.querySelector('#yellow-block');

//------------------- Configuracion de los canvas ------------------
let FPS = 1000 / 15;
let lastFrame = 0;
const cellSize = 45;
const ctxTetrisBoard = tetrisBoard.getContext('2d');
const ctxHoldCanvas = holdCanvas.getContext('2d');
const ctxNextCanvas = nextCanvas.getContext('2d');

// ----------------- Funciones de los canvas -----------------------
function initCanvases() {
  // Tetris board
  tetrisBoard.width = cellSize * 10;
  tetrisBoard.height = cellSize * 20;
  tetrisBoard.style.margin = 'auto';
  tetrisBoard.style.border = '1rem solid white';

  // Hold canvas
  holdCanvas.width = cellSize * 3;
  holdCanvas.height = cellSize * 4;
  holdCanvas.style.margin = '2rem 9rem';

  nextCanvas.width = cellSize * 3;
  nextCanvas.height = cellSize * 12;
  nextCanvas.style.margin = '5rem 9rem';
}

function drawCanvas(canvas, ctx) {
  const width = canvas.width / cellSize;
  const height = canvas.height / cellSize;

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      ctx.drawImage(blueBlock, i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}

function startGame() {
  initCanvases();
  drawCanvas(nextCanvas, ctxNextCanvas);
  drawCanvas(holdCanvas, ctxHoldCanvas);
  drawCanvas(tetrisBoard, ctxTetrisBoard);
  // purpleBlock.onload = () => ctxHoldCanvas.drawImage(purpleBlock, 10, 10);
  // ctxHoldCanvas.drawImage(blueBlock, 10, 10);
}

document.addEventListener('DOMContentLoaded', () => {
  startGame();
});
