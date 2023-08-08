//----------------------- Elementos de canvas --------------------
const tetrisBoard = document.querySelector('#tetris-board');
const holdTetromino = document.querySelector('#hold-tetromino');

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
let nextBlocks = [0, 0, 0];
let holdBlock;
let currentBlock;
let currentMatrix;
let currentAngle = 0;
let tetrisBoardMatrix = [];
let coords = { x: 0, y: 0 };
const keyState = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  c: false,
};

//------------------- Configuracion de los canvas ------------------
let FPS = 1000 / 20;
let frames = 0;
let lastFrame = 0;
const cellSize = 45;
const ctxTetrisBoard = tetrisBoard.getContext('2d');

// ----------------------- Bloques del Tetris ---------------------
// Bloques individuales
const redBlock = document.querySelector('#red-block');
const orangeBlock = document.querySelector('#orange-block');
const greenBlock = document.querySelector('#green-block');
const blueBlock = document.querySelector('#blue-block');
const strongBlueBlock = document.querySelector('#strong-blue-block');
const purpleBlock = document.querySelector('#purple-block');
const yellowBlock = document.querySelector('#yellow-block');

const blocks = {
  1: {
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    block: redBlock,
    tetromino: '/img/redSBlock.png',
  },
  2: {
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    block: orangeBlock,
    tetromino: '/img/orangeLBlock.png',
  },
  3: {
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    block: greenBlock,
    tetromino: '/img/greenSBlock.png',
  },
  4: {
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    block: strongBlueBlock,
    tetromino: '/img/blueLBlock.png',
  },
  5: {
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    block: purpleBlock,
    tetromino: '/img/TBlock.png',
  },
  6: {
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    block: blueBlock,
    tetromino: '/img/IBlock.png',
  },
  7: {
    matrix: [
      [1, 1],
      [1, 1],
    ],
    block: yellowBlock,
    tetromino: '/img/SquareBlock.png',
  },
};

// Objeto con las filas y columnas libres de cada rotacion en angulos de los tetrominos
const freeSpaceAngles = {
  0: { row: 2, column: 'none' },
  90: { row: 'none', column: 0 },
  180: { row: 0, column: 'none' },
  270: { row: 'none', column: 2 },
};

Object.seal(blocks);

// @see https://codereview.stackexchange.com/a/186834
function rotate() {
  const N = currentMatrix.length - 1;
  const result = currentMatrix.map((row, i) =>
    row.map((val, j) => currentMatrix[N - j][i])
  );
  return result;
}

function shift() {
  const [first, ...rest] = nextBlocks;
  nextBlocks = [...rest, first];
}

// Detecta colisiones
function collision() {
  return false;
}

// ----------------------- Eventos del teclado -----------------------

document.addEventListener('keydown', (e) => {
  const key = e.key;
  switch (key) {
    case 'ArrowUp':
      currentMatrix = rotate();
      return 'up';
    case 'ArrowDown':
      if (coords.y < 18) {
        coords.y++;
        console.log(coords.x);
      }
      break;
    case 'ArrowLeft':
      if (coords.x > 0) {
        coords.x--;
        console.log(coords.x);
      }
      break;
    case 'ArrowRight':
      if (coords.x < 10 - currentMatrix.length) {
        coords.x++;
        console.log(coords.x);
      }
      break;
    case 'c':
      holdBlock = currentBlock;
      break;

    default:
      return false;
  }
});

// ----------------- Funciones del tablero ------------------------

// Actualiza la matriz del tablero del tetris
function updateTetrisBoard() {
  const len = currentMatrix.length;

  // Pone el tetromino en el nuevo lugar
  let tetrominoIndexX = 0;
  let tetrominoIndexY = 0;
  let insideTetrominoZone = false;
  let insideTetrominoZoneX = false;
  let insideTetrominoZoneY = false;
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 10; j++) {
      insideTetrominoZoneX = j >= coords.x && j <= coords.x + len - 1;
      insideTetrominoZoneY = i >= coords.y && i <= coords.y + len - 1;
      insideTetrominoZone = insideTetrominoZoneX && insideTetrominoZoneY;

      if (
        insideTetrominoZone &&
        currentMatrix[tetrominoIndexY][tetrominoIndexX]
      ) {
        tetrisBoardMatrix[i][j] = currentBlock;
      } else {
        tetrisBoardMatrix[i][j] = 0;
      }

      if (insideTetrominoZoneX && tetrominoIndexX < len - 1) {
        tetrominoIndexX++;
      } else {
        tetrominoIndexX = 0;
      }
    }

    if (insideTetrominoZoneY && tetrominoIndexY < len - 1) {
      tetrominoIndexY++;
    } else {
      tetrominoIndexY = 0;
    }
  }
}

// Pone el bloque dentro del tablero del tetris
function updateTetrisCanvas() {
  // Limpiamos el canvas
  ctxTetrisBoard.clearRect(0, 0, tetrisBoard.width, tetrisBoard.height);

  // Dibujamos el bloque en su nueva posicion
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 10; j++) {
      if (tetrisBoardMatrix[i][j] > 0) {
        ctxTetrisBoard.drawImage(
          blocks[currentBlock].block,
          j * cellSize,
          i * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }
}

// Inicializa el tablero del tetris
function initTetrisBoard() {
  // Tetris board
  tetrisBoard.width = cellSize * 10;
  tetrisBoard.height = cellSize * 20;
  tetrisBoard.style.margin = 'auto';
  tetrisBoard.style.border = '1rem solid white';
  for (let i = 0; i < 20; i++) {
    tetrisBoardMatrix.push([]);
    for (let j = 0; j < 10; j++) {
      tetrisBoardMatrix[i].push(0);
    }
  }
}

// Mueve el bloque dentro del tablero de tetris
function moveBlock(timestamp) {
  const delta = timestamp - lastFrame;

  if (delta > FPS) {
    frames++;
    if (frames % 20 === 0) {
      if (coords.y + currentMatrix.length < 20) {
        coords.y++;
      }
    }
    updateTetrisBoard();
    updateTetrisCanvas();
    lastFrame = timestamp - (delta % FPS);
  }
  requestAnimationFrame(moveBlock);
}

// -------------------------- Clase encargada de la produccion de los bloques ---------------
class BlockFactory {
  // Obtiene el numero del siguiente bloque
  getNextBlock() {
    return Math.floor(Math.random() * 7) + 1;
  }

  // Empieza la generacion de bloques
  startGenBlocks() {
    currentBlock = this.getNextBlock();
    currentMatrix = blocks[currentBlock].matrix;
    currentAngle = currentBlock === 6 ? 180 : 0;
    console.log(currentMatrix);
    for (let i = 0; i < 3; i++) {
      nextBlocks[i] = this.getNextBlock();
      const nextTetromino = document.querySelector(`#next-tetromino-${i + 1}`);
      nextTetromino.src = blocks[nextBlocks[i]].tetromino;
    }
    this.genBlock(currentBlock);
  }

  // Actualiza los bloques siguientes
  updateNextBlocks() {
    const newBlock = this.getNextBlock();
    currentBlock = nextBlocks[0];
    currentMatrix = blocks[currentBlock].matrix;
    shift();
    nextBlocks[2] = newBlock;
    for (let i = 0; i < 3; i++) {
      const nextTetromino = document.querySelector(`#next-tetromino-${i + 1}`);
      nextTetromino.src = blocks[nextBlocks[i]].tetromino;
    }
    return currentBlock;
  }

  // Genera el bloque de acuerdo al numero
  genBlock(block) {
    switch (block) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        coords.x = 3;
        break;
      case 7:
        coords.x = 4;
        break;
      default:
        return;
    }
    coords.y = 0;
    updateTetrisBoard();
    updateTetrisCanvas();
    console.log(tetrisBoardMatrix);
  }
}

// ----------------------- Flujo del Juego ---------------------------
// Inicializa el juego
function startGame() {
  initTetrisBoard();
  const blockFactory = new BlockFactory();
  blockFactory.startGenBlocks();
  requestAnimationFrame(moveBlock);
}

window.onload = function () {
  startGame();
};
