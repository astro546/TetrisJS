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
let tetrisBoardMatrix = [];

//------------------- Configuracion de los canvas ------------------
let FPS = 1000 / 15;
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
Object.seal(blocks);

// @see https://codereview.stackexchange.com/a/186834
function rotate(block) {
  const N = block.length - 1;
  const result = block.map((row, i) => row.map((val, j) => block[N - j][i]));
  return result;
}

function shift() {
  const [first, ...rest] = nextBlocks;
  nextBlocks = [...rest, first];
}

function aimBlock() {}

// Clase encargada de la produccion de los bloques
class BlockFactory {
  // Obtiene el numero del siguiente bloque
  getNextBlock() {
    return Math.floor(Math.random() * 7) + 1;
  }

  // Pone el bloque dentro del tablero del tetris
  placeBlock(block, position) {
    const matrix = blocks[block].matrix;
    const len = matrix.length;

    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len; j++) {
        if (matrix[i][j]) {
          tetrisBoardMatrix[i][position + j] = 1;
          ctxTetrisBoard.drawImage(
            blocks[block].block,
            (j + position) * cellSize,
            i * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
    console.log(tetrisBoardMatrix);
  }

  // Empieza la generacion de bloques
  startGenBlocks() {
    currentBlock = this.getNextBlock();
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
    const currentBlock = nextBlocks[0];
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
        this.placeBlock(block, 3);
        break;
      case 7:
        this.placeBlock(block, 4);
        break;
      default:
        return;
    }
  }
}

// ----------------- Funciones de los canvas ------------------------
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

// ----------------------- Eventos del teclado -----------------------

// ----------------------- Flujo del Juego ---------------------------
// Inicializa el juego
function startGame() {
  initTetrisBoard();
  const blockFactory = new BlockFactory();
  blockFactory.startGenBlocks();
}

window.onload = function () {
  startGame();
};
