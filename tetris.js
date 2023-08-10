//----------------------- Elementos de canvas --------------------
const tetrisBoard = document.querySelector('#tetris-board');
const holdTetromino = document.querySelector('#hold-tetromino');
const tetrisUI = document.querySelector('#tetris-UI');

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
let holdBlock = 0;
let holdBlockAvailable = true;
let movementAvailable = true;
let currentBlock;
let currentMatrix;
let currentAngle = 0;
let tetrisBoardMatrix = [];
let coords = { x: 0, y: 0 };

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
    matrix: {
      0: [
        [1, 1, 0],
        [0, 1, 1],
      ],

      90: [
        [0, 1],
        [1, 1],
        [1, 0],
      ],

      180: [
        [1, 1, 0],
        [0, 1, 1],
      ],

      270: [
        [1, 1, 0],
        [0, 1, 1],
      ],
    },
    block: redBlock,
    tetromino: '/img/redSBlock.png',
  },

  2: {
    matrix: {
      0: [
        [0, 0, 1],
        [1, 1, 1],
      ],

      90: [
        [1, 0],
        [1, 0],
        [1, 1],
      ],

      180: [
        [1, 1, 1],
        [1, 0, 0],
      ],

      270: [
        [1, 1],
        [0, 1],
        [0, 1],
      ],
    },
    block: orangeBlock,
    tetromino: '/img/orangeLBlock.png',
  },

  3: {
    matrix: {
      0: [
        [0, 1, 1],
        [1, 1, 0],
      ],

      90: [
        [1, 0],
        [1, 1],
        [0, 1],
      ],

      180: [
        [0, 1, 1],
        [1, 1, 0],
      ],

      270: [
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    },
    block: greenBlock,
    tetromino: '/img/greenSBlock.png',
  },

  4: {
    matrix: {
      0: [
        [1, 0, 0],
        [1, 1, 1],
      ],

      90: [
        [1, 1],
        [1, 0],
        [1, 0],
      ],

      180: [
        [1, 1, 1],
        [0, 0, 1],
      ],

      270: [
        [0, 1],
        [0, 1],
        [1, 1],
      ],
    },
    block: strongBlueBlock,
    tetromino: '/img/blueLBlock.png',
  },
  5: {
    matrix: {
      0: [
        [0, 1, 0],
        [1, 1, 1],
      ],

      90: [
        [1, 0],
        [1, 1],
        [1, 0],
      ],

      180: [
        [1, 1, 1],
        [0, 1, 0],
      ],

      270: [
        [0, 1],
        [1, 1],
        [0, 1],
      ],
    },
    block: purpleBlock,
    tetromino: '/img/TBlock.png',
  },
  6: {
    matrix: {
      0: [[1, 1, 1, 1]],
      90: [[1], [1], [1], [1]],
      180: [[1, 1, 1, 1]],
      270: [[1], [1], [1], [1]],
    },
    block: blueBlock,
    tetromino: '/img/IBlock.png',
  },
  7: {
    matrix: {
      0: [
        [1, 1],
        [1, 1],
      ],

      90: [
        [1, 1],
        [1, 1],
      ],

      180: [
        [1, 1],
        [1, 1],
      ],

      270: [
        [1, 1],
        [1, 1],
      ],
    },
    block: yellowBlock,
    tetromino: '/img/SquareBlock.png',
  },
};
Object.seal(blocks);

// -------------------------- Clase encargada de la produccion de los bloques ---------------
class BlockFactory {
  // Obtiene el numero del siguiente bloque
  getNextBlock() {
    return Math.floor(Math.random() * 7) + 1;
  }

  // Empieza la generacion de bloques
  startGenBlocks() {
    currentBlock = this.getNextBlock();
    currentMatrix = blocks[currentBlock].matrix[0];
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
    currentMatrix = blocks[currentBlock].matrix[0];
    shiftNextBlocks();
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
    gameOver = losedGame();
    if (!gameOver) {
      updateTetrisBoard();
      updateTetrisCanvas();
    } else {
      showGameOver();
    }
  }
}
const blockFactory = new BlockFactory();

// ------------------ funciones de los tetrominos -------------------
// @see https://codereview.stackexchange.com/a/186834
function rotate() {
  if (currentAngle < 270) {
    currentAngle += 90;
  } else {
    currentAngle = 0;
  }
  return blocks[currentBlock].matrix[currentAngle];
}

// Detecta colisiones
function collision(direction, rotatedMatrix) {
  const matrix = rotatedMatrix ? rotatedMatrix : currentMatrix;
  const height = matrix.length;
  const width = matrix[0].length;

  let dx;
  let dy;
  switch (direction) {
    case 'left':
      dx = coords.x - 1;
      dy = coords.y;
      break;

    case 'right':
      dx = coords.x + 1;
      dy = coords.y;
      break;

    case 'down':
      dx = coords.x;
      dy = coords.y + 1;
      break;

    case 'rotation':
      dx = coords.x;
      dy = coords.y;
      break;

    default:
      break;
  }

  let outsideTetrisBoard = false;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (matrix[row][col]) {
        const newX = dx + col;
        const newY = dy + row;
        outsideTetrisBoard = newX < 0 || newX >= 10 || newY >= 20;

        if (outsideTetrisBoard || tetrisBoardMatrix[newY][newX] > 10) {
          return true;
        }
      }
    }
  }

  return false;
}

// Corrige la rotacion si se encuentra en un borde del tablero
function correctRotate(rotatedMatrix) {
  if (currentBlock !== 7) {
    for (let i = 0; i < rotatedMatrix.length; i++) {
      for (let j = 0; j < rotatedMatrix[i].length; j++) {
        // Evalua si algun bloque se va mas alla de la derecha del tablero
        if (rotatedMatrix[i][j] && coords.x + j >= 10) {
          if (rotatedMatrix[i].length === 3) {
            return coords.x - 1;
          } else {
            return 6;
          }
        }
      }
    }
  }
  return coords.x;
}

// ----------------------- Eventos del teclado -----------------------

document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (movementAvailable) {
    switch (key) {
      case 'ArrowUp':
        const rotatedMatrix = rotate();
        coords.x = correctRotate(rotatedMatrix);
        if (!collision('rotation', rotatedMatrix)) {
          currentMatrix = rotatedMatrix;
        }
        break;
      case 'ArrowDown':
        if (!collision('down')) {
          coords.y++;
          score++;
        }
        break;
      case 'ArrowLeft':
        if (!collision('left')) {
          coords.x--;
        }
        break;
      case 'ArrowRight':
        if (!collision('right')) {
          coords.x++;
        }
        break;
      case 'c':
        if (holdBlockAvailable) {
          if (holdBlock === 0) {
            holdBlock = currentBlock;
            currentBlock = blockFactory.updateNextBlocks();
          } else {
            const temp = currentBlock;
            currentBlock = holdBlock;
            holdBlock = temp;
          }
          holdTetromino.src = blocks[holdBlock].tetromino;
          currentMatrix = blocks[currentBlock].matrix[0];
          blockFactory.genBlock(currentBlock);
          holdBlockAvailable = false;
        }
        break;

      default:
        return false;
    }
  }
});

// ----------------- Funciones del tablero ------------------------

function shiftNextBlocks() {
  const [first, ...rest] = nextBlocks;
  nextBlocks = [...rest, first];
}

// Actualiza la matriz del tablero del tetris
function updateTetrisBoard() {
  const width = currentMatrix[0].length;
  const height = currentMatrix.length;

  // Pone el tetromino en el nuevo lugar
  let tetrominoIndexX = 0;
  let tetrominoIndexY = 0;
  let insideTetrominoZone = false;
  let insideTetrominoZoneX = false;
  let insideTetrominoZoneY = false;

  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 10; j++) {
      // Variables que verifican si los indices estan en la zona actual del tetromino
      insideTetrominoZoneX = j >= coords.x && j <= coords.x + width - 1;
      insideTetrominoZoneY = i >= coords.y && i <= coords.y + height - 1;
      insideTetrominoZone = insideTetrominoZoneX && insideTetrominoZoneY;

      if (
        insideTetrominoZone &&
        currentMatrix[tetrominoIndexY][tetrominoIndexX]
      ) {
        tetrisBoardMatrix[i][j] = currentBlock;
      } else if (
        (!insideTetrominoZone && tetrisBoardMatrix[i][j] < 10) ||
        (insideTetrominoZone &&
          currentMatrix[tetrominoIndexY][tetrominoIndexX] === 0 &&
          tetrisBoardMatrix[i][j] < 10)
      ) {
        tetrisBoardMatrix[i][j] = 0;
      }

      if (insideTetrominoZoneX && tetrominoIndexX < width - 1) {
        tetrominoIndexX++;
      } else {
        tetrominoIndexX = 0;
      }
    }

    if (insideTetrominoZoneY && tetrominoIndexY < height - 1) {
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
  let blockNum = 0;
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 10; j++) {
      if (tetrisBoardMatrix[i][j] > 0) {
        blockNum =
          tetrisBoardMatrix[i][j] > 10
            ? tetrisBoardMatrix[i][j] - 10
            : tetrisBoardMatrix[i][j];
        ctxTetrisBoard.drawImage(
          blocks[blockNum].block,
          j * cellSize,
          i * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }
}

// Inicializa los tableros del tetris
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

function placeBlock() {
  // Marca el bloque como establecido aumentando sus bloques en 10
  for (let i = 0; i < currentMatrix.length; i++) {
    for (let j = 0; j < currentMatrix[i].length; j++) {
      if (currentMatrix[i][j]) {
        tetrisBoardMatrix[coords.y + i][coords.x + j] = currentBlock + 10;
      }
    }
  }

  // Genera el siguiente bloque
  if (!gameOver) {
    currentBlock = blockFactory.updateNextBlocks();
    currentMatrix = blocks[currentBlock].matrix[0];
    blockFactory.genBlock(currentBlock);
  }
}

// Muestra la puntuacion, nivel y lineas completadas
function showScoreInfo() {
  scoreElement.textContent = `${score}`;
  levelElement.textContent = `${level}`;
  linesElement.textContent = `${lines}`;
}

// Calcula la puntuacion
function calculateScore(numLines) {
  let newScore = 0;
  switch (numLines) {
    case 1:
      newScore = 100 * level;
      break;

    case 2:
      newScore = 300 * level;
      break;

    case 3:
      newScore = 500 * level;
      break;

    default:
      newScore = numLines * 100 * level;
  }

  if (comboCounter > 1) {
    newScore += 50 * comboCounter * level;
  }

  score += newScore;
}

// Verifica si hay una linea completada
function verifyLines() {
  let lineIndex = 0;
  let winnerLines = [];
  const verifyWinnerLine = (number) => number === 0;
  for (let line of tetrisBoardMatrix) {
    const incompleteLine = line.some(verifyWinnerLine);
    if (!incompleteLine) {
      winnerLines.push(lineIndex);
    }
    lineIndex++;
  }
  return winnerLines;
}

// Actualiza el tablero cuando hay una linea completada
async function removeWinnerLine(winnerLines) {
  for (let indexLine of winnerLines) {
    tetrisBoardMatrix.splice(indexLine, 1); //Elimina la linea completada
    tetrisBoardMatrix.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); //Pone una nueva linea al inicio
  }
  movementAvailable = true;
}

// Calcula la puntuacion y muestra la animacion de lineas completadas
async function winRoutine(winnerLines) {
  clearLine = (lineNumber) => {
    console.log('desde clearLine');
    ctxTetrisBoard.clearRect(
      0,
      lineNumber * cellSize,
      tetrisBoard.width,
      cellSize
    );
  };

  async function flash(lineNumber) {
    console.log('desde flash');
    clearLine(lineNumber);
    ctxTetrisBoard.fillStyle = 'white';
    ctxTetrisBoard.fillRect(
      0,
      lineNumber * cellSize,
      tetrisBoard.width,
      cellSize
    );
  }

  async function clearLineCallback(lineNumber) {
    return new Promise((resolve) => {
      console.log('desde clearLineCallback');
      setTimeout(() => {
        clearLine(lineNumber);
        resolve();
      }, 500);
    });
  }

  async function flashAnimation(lineNumber) {
    await flash(lineNumber);
    await clearLineCallback(lineNumber);
  }

  const animations = [];
  for (let lineNumber of winnerLines) {
    animations.push(() => flashAnimation(lineNumber));
  }

  // Calculo de la puntuacion
  lines += winnerLines.length;
  comboCounter += 1;
  calculateScore(winnerLines.length);
  if (lines % 10 === 0) level++;

  // Animacion
  await Promise.all(animations.map((animation) => animation()));
  await removeWinnerLine(winnerLines);
}

// Verifica si el usuario ha perdido
function losedGame() {
  const width = currentMatrix[0].length;
  const height = currentMatrix.length;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (
        tetrisBoardMatrix[coords.y + row][coords.x + col] > 10 &&
        currentMatrix[row][col]
      ) {
        return true;
      }
    }
  }
  return false;
}

// Muestra la pantalla de Game Over
function showGameOver() {
  // Crea los elementos de alerta de juego terminado
  const gameOverAlert = document.createElement('div');
  const alertTitle = document.createElement('h2');
  const alertScore = document.createElement('h3');
  const alertMaxScore = document.createElement('h3');
  const startButton = document.createElement('a');

  // Quita el tablero de tetris y las demas secciones
  tetrisUI.remove();

  // Ponemos las clases a los elementos
  gameOverAlert.classList.add('alert');
  alertTitle.classList.add('alert-title');
  alertScore.classList.add('alert-score');
  alertMaxScore.classList.add('alert-score');
  startButton.classList.add('start-button');
  alertMaxScore.id = 'alert-max-score';

  // Ponemos el contenido a los elementos
  alertTitle.textContent = 'GAME OVER';
  alertScore.innerHTML = `SCORE: <span class="max-score">${score}</span>`;
  alertMaxScore.innerHTML = `MAX SCORE: <span class="max-score">${score}</span>`;
  startButton.textContent = 'START';

  // Poner la accion al boton de start
  startButton.onclick = function () {
    restartGame(gameOverAlert);
  };

  // Ponemos los elementos en pantalla
  document.body.appendChild(gameOverAlert);
  gameOverAlert.appendChild(alertTitle);
  gameOverAlert.appendChild(alertScore);
  gameOverAlert.appendChild(alertMaxScore);
  gameOverAlert.appendChild(startButton);
}

async function restartGame(gameOverAlert) {
  // Reinicia las variables
  score = 0;
  level = 1;
  lines = 0;
  comboCounter = 0;
  gameOver = false;
  nextBlocks = [0, 0, 0];
  holdBlock = 0;
  holdBlockAvailable = true;
  movementAvailable = true;
  currentAngle = 0;
  tetrisBoardMatrix = [];
  coords = { x: 0, y: 0 };

  gameOverAlert.remove();
  document.body.appendChild(tetrisUI);
  holdTetromino.src = '';
  startGame();
}

// Mueve el bloque dentro del tablero de tetris
async function moveBlock(timestamp) {
  const delta = timestamp - lastFrame;
  let winnerLines;

  if (delta > FPS) {
    frames++;
    if (frames % 20 === 0) {
      if (!collision('down')) {
        coords.y++;
      } else {
        placeBlock();
        winnerLines = verifyLines();
        if (winnerLines.length > 0) {
          movementAvailable = false;
          await winRoutine(winnerLines);
        }
        comboCounter = 0;
        holdBlockAvailable = true;
      }
    }
    showScoreInfo();
    updateTetrisBoard();
    updateTetrisCanvas();
    lastFrame = timestamp - (delta % FPS);
  }
  requestAnimationFrame(moveBlock);
}

// ----------------------- Flujo del Juego ---------------------------
// Inicializa el juego
function startGame() {
  initTetrisBoard();
  blockFactory.startGenBlocks();
  requestAnimationFrame(moveBlock);
}

window.onload = function () {
  startGame();
};
