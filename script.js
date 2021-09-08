console.log('working!')

function player(name) {
  return { name }
}

const gameboard = (() => {
  let board = [['O', 'X', 'O'],['B', 'O', 'X'],['O', 'X', 'O']];

  return { board }
})()

// Create seperate get squares method maybe in some get stuff module
const elementSelector = (()=> {
  const squares = document.querySelectorAll('.square');

  return { squares }
})()

const displayController = (() => {
  const displayBoard = (board, boardElement) => {
    const squares = elementSelector.squares
    squares.forEach(square => {
      let [idx1, idx2] = square.dataset.key.split('');
      square.innerHTML = gameboard.board[idx1][idx2];
    });
  }
  
  return {displayBoard}
})()

const gameEngine = (() => {
  // Only really want to initalize boards etc once, not in individual functions
  const board = gameboard.board;
  const boardElement = document.querySelector('.board');

  displayController.displayBoard(board, boardElement);
  
})()

const interactionListeners = (() => {
  // Board squares
  elementSelector.squares.forEach(square => {
    square.addEventListener('click', doSomething);
  });
})()

//messing
function doSomething(e) {
  console.log(e.target);
}
