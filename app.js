document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.main-grid');
  let squares = Array.from(document.querySelectorAll('.main-grid div'));
  const scoreElement = document.querySelector('.tetris__score');
  const scoreNumberElement = document.querySelector('#score');
  const highScoreNumberElement = document.querySelector('#highscore');
  const startButton = document.querySelector('#start-button');

  const highscoreLocalstorage = localStorage.getItem('highscore');
  if (highscoreLocalstorage) {
    highScoreNumberElement.innerHTML = highscoreLocalstorage;
  } else {
    highScoreNumberElement.innerHTML = 'No highscore yet :c';
  }

  let timerId;
  const mainGridWidth = 10;
  const safeStartDistanceFromRightEdge = 2;
  let score = 0;
  let timeForOneStep = 1000;

  const lTetromino = [
    [1, mainGridWidth + 1, mainGridWidth * 2 + 1, 2],
    [1, 2, 3, mainGridWidth + 3],
    [2, mainGridWidth + 2, mainGridWidth * 2 + 2, mainGridWidth * 2 + 1],
    [1, mainGridWidth + 1, mainGridWidth + 2, mainGridWidth + 3],
  ];

  const zTetromino = [
    [0, mainGridWidth, mainGridWidth + 1, mainGridWidth * 2 + 1],
    [mainGridWidth + 1, mainGridWidth + 2, mainGridWidth * 2, mainGridWidth * 2 + 1],
    [0, mainGridWidth, mainGridWidth + 1, mainGridWidth * 2 + 1],
    [mainGridWidth + 1, mainGridWidth + 2, mainGridWidth * 2, mainGridWidth * 2 + 1],
  ];

  const tTetromino = [
    [2, mainGridWidth + 1, mainGridWidth + 2, mainGridWidth + 3],
    [1, mainGridWidth + 1, mainGridWidth + 2, mainGridWidth * 2 + 1],
    [1, 2, 3, mainGridWidth + 2],
    [2, mainGridWidth + 1, mainGridWidth + 2, mainGridWidth * 2 + 2],
  ];

  const oTetromino = [
    [0, 1, mainGridWidth, mainGridWidth + 1],
    [0, 1, mainGridWidth, mainGridWidth + 1],
    [0, 1, mainGridWidth, mainGridWidth + 1],
    [0, 1, mainGridWidth, mainGridWidth + 1],
  ]

  const iTetromino = [
    [1, mainGridWidth + 1, mainGridWidth * 2 + 1, mainGridWidth * 3 + 1],
    [1, 2, 3, 4],
    [1, mainGridWidth + 1, mainGridWidth * 2 + 1, mainGridWidth * 3 + 1],
    [1, 2, 3, 4],
  ];

  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

  const getRandomIndex = () => Math.floor(Math.random() * theTetrominoes.length);
  const getRandomStartPosition = () => Math.floor(Math.random() * (mainGridWidth - safeStartDistanceFromRightEdge));

  let currentPosition = getRandomStartPosition();
  let currentRotation = 0;
  let randomTetrominoIndex = getRandomIndex();
  let nextRandomTetrominoIndex = getRandomIndex();
  let currentTetromino = theTetrominoes[randomTetrominoIndex][currentRotation];

  const paint = (classAction) => {
    currentTetromino.forEach(index => {
      squares[currentPosition + index].classList[classAction]('tetromino');
    })
  }

  const freeze = () => {
    const nextLineContainsTakenClass = currentTetromino.some(index => (
      squares[currentPosition + index + mainGridWidth].classList.contains('main-grid__frozen')
    ));
    if (nextLineContainsTakenClass) {
      currentTetromino.forEach(index => squares[currentPosition + index].classList.add('main-grid__frozen', 'tetromino-frozen'));
      randomTetrominoIndex = nextRandomTetrominoIndex;
      nextRandomTetrominoIndex = getRandomIndex();
      currentRotation = 0;
      currentTetromino = theTetrominoes[randomTetrominoIndex][currentRotation];
      currentPosition = getRandomStartPosition();
      addScore();
      paint('add');
      displayNextTetromino();
      gameOver();
    }
  }
    
  const moveDown = () => {
    paint('remove');
    currentPosition += mainGridWidth;
    paint('add');
    freeze();
  }
  
  const isAtLeftEdge = () => currentTetromino.some(index => (currentPosition + index) % mainGridWidth === 0);
  
  const isAtRightEdge = () => currentTetromino.some(index => (currentPosition + index + 1) % mainGridWidth === 0);

  const moveLeft = () => {
    paint('remove');
    if (!isAtLeftEdge()) {
      currentPosition -= 1;
    }
    if (currentTetromino.some(index => squares[currentPosition + index].classList.contains('main-grid__frozen'))) {
      currentPosition += 1;
    }
    paint('add');
  }

  const moveRight = () => {
    paint('remove');
    if (!isAtRightEdge()) {
      currentPosition += 1;
    }
    if(currentTetromino.some(index => squares[currentPosition + index].classList.contains('main-grid__frozen'))) {
      currentPosition -= 1;
    }

    paint('add');
  }

  function checkRotatedPosition(position){
    if ((position + 1) % mainGridWidth < 4) {  
      if (isAtRightEdge()) {
        currentPosition += 1;
        checkRotatedPosition(currentPosition);
      }
    }
    else if (position % mainGridWidth > 5) {
      if (isAtLeftEdge()) {
        currentPosition -= 1;
        checkRotatedPosition(currentPosition);
      }
    }
  }

  function rotate() {
    paint('remove');
    currentRotation += 1;
    if (currentRotation === currentTetromino.length) {
      currentRotation = 0;
    }
    currentTetromino = theTetrominoes[randomTetrominoIndex][currentRotation];
    checkRotatedPosition(currentPosition);
    paint('add');
  }

  const clueSquares = document.querySelectorAll('.clue-grid__cell');
  const clueGridWidth = 5;
  let clueDisplayIndex = 6;

  const clueTetrominoes = [
    [1, clueGridWidth + 1, clueGridWidth * 2 + 1, 2], // lTetromino
    [0, clueGridWidth, clueGridWidth + 1, clueGridWidth * 2 + 1], // zTetromino
    [1, clueGridWidth, clueGridWidth + 1, clueGridWidth + 2], // tTetromino
    [0, 1, clueGridWidth, clueGridWidth + 1], // oTetromino
    [1, clueGridWidth + 1, clueGridWidth * 2 + 1, clueGridWidth * 3 + 1] // iTetromino
  ];

  function displayNextTetromino() {
    clueSquares.forEach(square => {
      square.classList.remove('tetromino');
    });
    clueTetrominoes[nextRandomTetrominoIndex].forEach(index => {
      clueSquares[clueDisplayIndex + index].classList.add('tetromino');
    });
  }

  function addScore() {
    for (let i = 0; i < 199; i += mainGridWidth) {
      const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];

      if (row.every(index => squares[index].classList.contains('main-grid__frozen'))) {
        score += 10;
        scoreNumberElement.innerHTML = score;
        row.forEach(index => {
          squares[index].classList.remove('main-grid__frozen');
          squares[index].classList.remove('tetromino');
          squares[index].classList.remove('tetromino-frozen');
        });
        const squaresRemoved = squares.splice(i, mainGridWidth);
        squares = squaresRemoved.concat(squares);
        squares.forEach(cell => grid.appendChild(cell));
        clearInterval(timerId);
        timerId = setInterval(moveDown, timeForOneStep -= 50)
      }
    }
  }

  function gameOver() {
    if (currentTetromino.some(index => squares[currentPosition + index].classList.contains('main-grid__frozen'))) {
      clearInterval(timerId);
      startButton.innerText = 'Restart';
      scoreElement.innerHTML = `Wow! Your final score: <span id="score">${score}</span>!!!!`;
      if (highscoreLocalstorage < score) {
        localStorage.setItem('highscore', score);
      }
    }
  }

  startButton.addEventListener('click', () => {
    if (startButton.innerText === 'Restart') {
      location.reload();
    } else if (startButton.innerText === 'Pause') {
      startButton.innerText = 'Start';
      clearInterval(timerId);
      timerId = null;
    } else {
      startButton.innerText = 'Pause';
      paint('add');
      timerId = setInterval(moveDown, timeForOneStep);
      nextRandomTetrominoIndex = getRandomIndex();
      displayNextTetromino();
    }
  })

  function control(e) {
    if(e.keyCode === 37) {
      moveLeft();
    } else if (e.keyCode === 38) {
      rotate();
    } else if (e.keyCode === 39) {
      moveRight();
    } else if (e.keyCode === 40) {
      moveDown();
    }
  }

  document.addEventListener('keyup', control);
})