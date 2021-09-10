console.log('working!')

const gameboard = (() => {
  let board = [['', '', ''],['', '', ''],['', '', '']];

  return { board }
})()

const gameLogic = (() => {
  const fillSquare = (e) => {
    let [idx1, idx2] = e.target.dataset.key;
    gameboard.board[idx1][idx2] = 'Rad!';
    displayController.displayBoard();
    //UNCOUPLE DISPLAY FROM HERE MAYBE
    //ASSIGN THE PLAYER SYMBOL
    // add check for existing symbol
  }

  return { fillSquare }
})()

function player(name) {
  return { name }
}

const elementSelector = (() => {
  const squares = document.querySelectorAll('.square');
  
  return { squares }
})()


const interactionListener = (() => {
  // Board squares
  elementSelector.squares.forEach(square => {
    square.addEventListener('click', gameLogic.fillSquare);
  });
})()

const displayController = (() => {
  const displayBoard = (board, boardElement) => {
    const squares = elementSelector.squares
    squares.forEach(square => {
      let [idx1, idx2] = square.dataset.key.split('');
      square.innerHTML = gameboard.board[idx1][idx2];
    });
  }
  
  return { displayBoard }
})()


const gameEngine = (() => {
  // Only really want to initalize boards etc once, not in individual functions
  const board = gameboard.board;
  const boardElement = document.querySelector('.board');

  displayController.displayBoard(board, boardElement);
})()

