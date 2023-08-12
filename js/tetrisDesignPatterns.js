// Version del tetris con los siguientes patrones de diseñó: Class Pattern, Singleton, Namespace y Mediator
//----------------------- Elementos de canvas --------------------
const tetrisUI = document.querySelector('#tetris-UI');
const holdTetromino = document.querySelector('#hold-tetromino');

// Elementos de puntuacion
const scoreElement = document.querySelector('#score');
const levelElement = document.querySelector('#level');
const linesElement = document.querySelector('#lines');

// Bloques individuales
const redBlock = document.querySelector('#red-block');
const orangeBlock = document.querySelector('#orange-block');
const greenBlock = document.querySelector('#green-block');
const blueBlock = document.querySelector('#blue-block');
const strongBlueBlock = document.querySelector('#strong-blue-block');
const purpleBlock = document.querySelector('#purple-block');
const yellowBlock = document.querySelector('#yellow-block');

//------------------- Tablero del tetris ------------------

class TetrisBoard {
  constructor(game) {
    this.FPS = 1000 / 20;
    this.frames = 0;
    this.lastFrame = 0;
    this.cellSize = 45;
    this.tetrisBoardMatrix = [];
    this.tetrisBoard = document.querySelector('#tetris-board');
    this.ctxTetrisBoard = this.tetrisBoard.getContext('2d');
    this.game = game;
  }

  // Actualiza la matriz del tablero del tetris
  updateTetrisBoard() {
    const width = this.game.currentMatrix[0].length;
    const height = this.game.currentMatrix.length;

    // Pone el tetromino en el nuevo lugar
    let tetrominoIndexX = 0;
    let tetrominoIndexY = 0;
    let insideTetrominoZone = false;
    let insideTetrominoZoneX = false;
    let insideTetrominoZoneY = false;

    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 10; j++) {
        // Variables que verifican si los indices estan en la zona actual del tetromino
        insideTetrominoZoneX =
          j >= this.game.coords.x && j <= this.game.coords.x + width - 1;
        insideTetrominoZoneY =
          i >= this.game.coords.y && i <= this.game.coords.y + height - 1;
        insideTetrominoZone = insideTetrominoZoneX && insideTetrominoZoneY;

        if (
          insideTetrominoZone &&
          this.game.currentMatrix[tetrominoIndexY][tetrominoIndexX]
        ) {
          this.tetrisBoardMatrix[i][j] = this.game.currentBlock;
        } else if (
          (!insideTetrominoZone && this.tetrisBoardMatrix[i][j] < 10) ||
          (insideTetrominoZone &&
            this.game.currentMatrix[tetrominoIndexY][tetrominoIndexX] === 0 &&
            this.tetrisBoardMatrix[i][j] < 10)
        ) {
          this.tetrisBoardMatrix[i][j] = 0;
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
  updateTetrisCanvas() {
    // Limpiamos el canvas
    this.ctxTetrisBoard.clearRect(
      0,
      0,
      this.tetrisBoard.width,
      this.tetrisBoard.height
    );

    // Dibujamos el bloque en su nueva posicionthis.
    let blockNum = 0;
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 10; j++) {
        if (this.tetrisBoardMatrix[i][j] > 0) {
          blockNum =
            this.tetrisBoardMatrix[i][j] > 10
              ? this.tetrisBoardMatrix[i][j] - 10
              : this.tetrisBoardMatrix[i][j];
          this.ctxTetrisBoard.drawImage(
            this.game.blocks[blockNum].block,
            j * this.cellSize,
            i * this.cellSize,
            this.cellSize,
            this.cellSize
          );
        }
      }
    }
  }

  // Inicializa los tableros del tetris
  initTetrisBoard() {
    // Tetris board
    this.tetrisBoard.width = this.cellSize * 10;
    this.tetrisBoard.height = this.cellSize * 20;
    this.tetrisBoard.style.margin = 'auto';
    this.tetrisBoard.style.border = '1rem solid white';
    for (let i = 0; i < 20; i++) {
      this.tetrisBoardMatrix.push([]);
      for (let j = 0; j < 10; j++) {
        this.tetrisBoardMatrix[i].push(0);
      }
    }
  }

  placeBlock() {
    // Marca el bloque como establecido aumentando sus bloques en 10
    for (let i = 0; i < this.game.currentMatrix.length; i++) {
      for (let j = 0; j < this.game.currentMatrix[i].length; j++) {
        if (this.game.currentMatrix[i][j]) {
          this.tetrisBoardMatrix[this.game.coords.y + i][
            this.game.coords.x + j
          ] = this.game.currentBlock + 10;
        }
      }
    }

    // Genera el siguiente bloque
    if (!this.game.gameOver) {
      this.game.factory.updateNextBlocks();
      this.game.currentMatrix =
        this.game.blocks[this.game.currentBlock].matrix[0];
      this.game.factory.genBlock(this.game.currentBlock);
    }
  }

  // Verifica si hay una linea completada
  verifyLines() {
    let lineIndex = 0;
    let winnerLines = [];
    const verifyWinnerLine = (number) => number === 0;
    for (let line of this.tetrisBoardMatrix) {
      const incompleteLine = line.some(verifyWinnerLine);
      if (!incompleteLine) {
        winnerLines.push(lineIndex);
      }
      lineIndex++;
    }
    return winnerLines;
  }

  // Actualiza el tablero cuando hay una linea completada
  async removeWinnerLine(winnerLines) {
    for (let indexLine of winnerLines) {
      this.tetrisBoardMatrix.splice(indexLine, 1); //Elimina la linea completada
      this.tetrisBoardMatrix.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); //Pone una nueva linea al inicio
    }
    this.game.movementAvailable = true;
  }

  // Calcula la puntuacion y muestra la animacion de lineas completadas
  async winRoutine(winnerLines) {
    // Asignamos el contexto de la clase a las funciones anidadas
    const self = this;

    function clearLine(lineNumber) {
      self.ctxTetrisBoard.clearRect(
        0,
        lineNumber * self.cellSize,
        self.tetrisBoard.width,
        self.cellSize
      );
    }

    async function flash(lineNumber) {
      clearLine(lineNumber);
      self.ctxTetrisBoard.fillStyle = 'white';
      self.ctxTetrisBoard.fillRect(
        0,
        lineNumber * self.cellSize,
        self.tetrisBoard.width,
        self.cellSize
      );
    }

    async function clearLineCallback(lineNumber) {
      return new Promise((resolve) => {
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
    this.game.lines += winnerLines.length;
    this.game.comboCounter += 1;
    this.game.scoring.calculateScore(winnerLines.length);
    this.game.level = Math.floor(this.game.lines / 10) + 1;

    // Animacion
    await Promise.all(animations.map((animation) => animation()));
    await this.removeWinnerLine(winnerLines);
  }

  // Verifica si el usuario ha perdido
  losedGame() {
    const width = this.game.currentMatrix[0].length;
    const height = this.game.currentMatrix.length;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (
          this.tetrisBoardMatrix[this.game.coords.y + row][
            this.game.coords.x + col
          ] > 10 &&
          this.game.currentMatrix[row][col]
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // Mueve el bloque dentro del tablero de tetris
  async moveBlock(timestamp) {
    const delta = timestamp - this.lastFrame;
    let winnerLines;

    if (delta > this.FPS) {
      this.frames++;
      if (this.frames % 20 === 0) {
        if (!this.game.blocks.functions.collision('down')) {
          this.game.coords.y++;
        } else {
          this.placeBlock();
          winnerLines = this.verifyLines();
          if (winnerLines.length > 0) {
            this.game.movementAvailable = false;
            await this.winRoutine(winnerLines);
          } else {
            this.game.comboCounter = 0;
          }
          this.game.holdBlockAvailable = true;
        }
      }
      this.game.scoring.showScoreInfo();
      this.updateTetrisBoard();
      this.updateTetrisCanvas();
      this.lastFrame = timestamp - (delta % this.FPS);
    }
    requestAnimationFrame(this.moveBlock.bind(this));
  }
}

// ----------------------- Bloques del Tetris ---------------------

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
        [0, 1],
        [1, 1],
        [1, 0],
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

// ------------------------------- Funciones de los tetrominos -----------------------------
blocks.functions = {
  // Cada funcion se agrega al objeto blocks con bind

  rotate: function () {
    if (this.game.currentAngle < 270) {
      this.game.currentAngle += 90;
    } else {
      this.game.currentAngle = 0;
    }
    return blocks[this.game.currentBlock].matrix[this.game.currentAngle];
  }.bind(blocks),

  collision: function (direction, rotatedMatrix) {
    const matrix = rotatedMatrix ? rotatedMatrix : this.game.currentMatrix;
    const height = matrix.length;
    const width = matrix[0].length;

    let dx;
    let dy;
    switch (direction) {
      case 'left':
        dx = this.game.coords.x - 1;
        dy = this.game.coords.y;
        break;

      case 'right':
        dx = this.game.coords.x + 1;
        dy = this.game.coords.y;
        break;

      case 'down':
        dx = this.game.coords.x;
        dy = this.game.coords.y + 1;
        break;

      case 'rotation':
        dx = this.game.coords.x;
        dy = this.game.coords.y;
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

          if (
            outsideTetrisBoard ||
            this.game.board.tetrisBoardMatrix[newY][newX] > 10
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }.bind(blocks),

  correctRotate: function (rotatedMatrix) {
    if (this.game.currentBlock !== 7) {
      for (let i = 0; i < rotatedMatrix.length; i++) {
        for (let j = 0; j < rotatedMatrix[i].length; j++) {
          // Evalua si algun bloque se va mas alla de la derecha del tablero
          if (rotatedMatrix[i][j] && this.game.coords.x + j >= 10) {
            if (rotatedMatrix[i].length === 3) {
              return this.game.coords.x - 1;
            } else {
              return 6;
            }
          }
        }
      }
    }
    return this.game.coords.x;
  }.bind(blocks),
};

// -------------------------- Clase encargada de la produccion de los bloques ---------------
class BlockFactory {
  constructor(game) {
    this.game = game;
    this.nextBlocks = [0, 0, 0];
    this.holdBlock = 0;
  }

  // Obtiene el numero del siguiente bloque
  getNextBlock() {
    return Math.floor(Math.random() * 7) + 1;
  }

  shiftNextBlocks() {
    const [first, ...rest] = this.nextBlocks;
    this.nextBlocks = [...rest, first];
  }

  // Empieza la generacion de bloques
  startGenBlocks() {
    this.game.currentBlock = this.getNextBlock();
    this.game.currentMatrix =
      this.game.blocks[this.game.currentBlock].matrix[0];
    for (let i = 0; i < 3; i++) {
      this.nextBlocks[i] = this.getNextBlock();
      const nextTetromino = document.querySelector(`#next-tetromino-${i + 1}`);
      nextTetromino.src = this.game.blocks[this.nextBlocks[i]].tetromino;
    }
    this.genBlock(this.game.currentBlock);
  }

  // Actualiza los bloques siguientes
  updateNextBlocks() {
    const newBlock = this.getNextBlock();
    this.game.currentBlock = this.nextBlocks[0];
    this.game.currentMatrix =
      this.game.blocks[this.game.currentBlock].matrix[0];
    this.shiftNextBlocks();
    this.nextBlocks[2] = newBlock;
    for (let i = 0; i < 3; i++) {
      const nextTetromino = document.querySelector(`#next-tetromino-${i + 1}`);
      nextTetromino.src = blocks[this.nextBlocks[i]].tetromino;
    }
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
        this.game.coords.x = 3;
        break;
      case 7:
        this.game.coords.x = 4;
        break;
      default:
        return;
    }
    this.game.coords.y = 0;
    this.game.gameOver = this.game.board.losedGame();
    if (!this.game.gameOver) {
      this.game.board.updateTetrisBoard();
      this.game.board.updateTetrisCanvas();
    } else {
      sessionStorage.setItem('currentScore', `${this.game.score}`);
      window.location.href = 'index.html';
    }
  }
}

// -------------------------- Manejador de la logica del juego --------------
class TetrisScoring {
  constructor(game) {
    this.game = game;
  }

  // Muestra la puntuacion, nivel y lineas completadas
  showScoreInfo() {
    scoreElement.textContent = `${this.game.score}`;
    levelElement.textContent = `${this.game.level}`;
    linesElement.textContent = `${this.game.lines}`;
  }

  // Calcula la puntuacion
  calculateScore(numLines) {
    let newScore = 0;
    switch (numLines) {
      case 1:
        newScore = 100 * this.game.level;
        break;

      case 2:
        newScore = 300 * this.game.level;
        break;

      case 3:
        newScore = 500 * this.game.level;
        break;

      case 4:
        newScore = 800 * this.game.level;
        break;

      default:
        newScore = numLines * 100 * this.game.level + 800;
        break;
    }

    if (this.game.comboCounter > 1) {
      newScore += 50 * this.game.comboCounter * this.game.level;
    }

    this.game.score += newScore;
  }
}

// ------------------------ Clase de eventos de teclado --------------------
class KeyBoardHandler {
  constructor(game) {
    this.game = game;
    this.init();
  }

  init() {
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  handleKeyPress(e) {
    const key = e.key;
    if (this.game.movementAvailable) {
      switch (key) {
        case 'ArrowUp':
          const rotatedMatrix = this.game.blocks.functions.rotate();
          this.game.coords.x =
            this.game.blocks.functions.correctRotate(rotatedMatrix);
          if (
            !this.game.blocks.functions.collision('rotation', rotatedMatrix)
          ) {
            this.game.currentMatrix = rotatedMatrix;
          }
          break;
        case 'ArrowDown':
          if (!this.game.blocks.functions.collision('down')) {
            this.game.coords.y++;
            this.game.score++;
          }
          break;
        case 'ArrowLeft':
          if (!this.game.blocks.functions.collision('left')) {
            this.game.coords.x--;
          }
          break;
        case 'ArrowRight':
          if (!this.game.blocks.functions.collision('right')) {
            this.game.coords.x++;
          }
          break;
        case 'c':
          if (this.game.holdBlockAvailable) {
            if (this.game.factory.holdBlock === 0) {
              this.game.factory.holdBlock = this.game.currentBlock;
              this.game.factory.updateNextBlocks();
            } else {
              const temp = this.game.currentBlock;
              this.game.currentBlock = this.game.factory.holdBlock;
              this.game.factory.holdBlock = temp;
            }
            holdTetromino.src =
              this.game.blocks[this.game.factory.holdBlock].tetromino;
            this.game.currentMatrix =
              this.game.blocks[this.game.currentBlock].matrix[0];
            this.game.factory.genBlock(this.game.currentBlock);
            this.game.holdBlockAvailable = false;
          }
          break;

        default:
          return false;
      }
    }
  }
}

// ------------------------ Clase mediadora --------------------------------
class Game {
  constructor(blocks, factory, board, scoring, keyBoardHandler) {
    // Objetos de las otras clases
    this.factory = factory;
    this.board = board;
    this.scoring = scoring;
    this.keyBoardHandler = keyBoardHandler;
    this.blocks = blocks;

    // Variables de la logica del juego
    this.coords = { x: 0, y: 0 };
    this.currentBlock;
    this.currentMatrix;
    this.currentAngle = 0;
    this.holdBlockAvailable = true;
    this.movementAvailable = true;

    // Variables de puntuacion
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.comboCounter = 0;
    this.gameOver = false;
  }

  // Inicializa el juego
  startGame() {
    this.board.initTetrisBoard();
    this.factory.startGenBlocks();
    requestAnimationFrame(this.board.moveBlock.bind(this.board));
  }
}

const game = new Game();
const blockFactory = new BlockFactory(game);
const board = new TetrisBoard(game);
const tetrisScoring = new TetrisScoring(game);
const keyBoardHandler = new KeyBoardHandler(game);
blocks.game = game;

game.blocks = blocks;
game.factory = blockFactory;
game.board = board;
game.scoring = tetrisScoring;
game.keyBoardHandler = keyBoardHandler;

window.onload = function () {
  game.startGame();
};
