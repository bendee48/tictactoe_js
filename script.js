console.log('working!')

function player(name) {
  return { name }
}

const gameboard = (() => {
  let board = [['O', 'X', 'O'],['X', 'O', 'X'],['O', 'X', 'O']];

  return { board }
})()


const displayController = (() => {
  const displayBoard = (board, boardElement) => {
    boardElement.innerHTML = `<div>${board}</div><div>hello</div>`
  }
  
  return {displayBoard}
})()

const gameEngine = (() => {
  // Only really want to initalize boards etc once, not in individual functions
  const board = gameboard.board;
  const boardElement = document.querySelector('.board');

  displayController.displayBoard(board, boardElement);
  
})()