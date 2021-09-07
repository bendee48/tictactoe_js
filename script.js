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
    let str = "";
    board.forEach((row, rowIndex) => {
      row.forEach((square, sqIndex) => {
        str += `<div class="square" data-key="${rowIndex}${sqIndex}">${square}</div>`
      });
    });
    boardElement.innerHTML = str;
  }
  
  return {displayBoard}
})()

const gameEngine = (() => {
  // Only really want to initalize boards etc once, not in individual functions
  const board = gameboard.board;
  const boardElement = document.querySelector('.board');

  displayController.displayBoard(board, boardElement);
  
})()
