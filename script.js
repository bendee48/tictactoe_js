console.log('working!')

const gameboard = (() => {
  let board = [['', '', ''],['', '', ''],['', '', '']];

  return { board }
})()

const player = function(name, mark) {
  return { name, mark }
}
 
const players = (() => {
  const player1 = player('Player 1', 'X');
  const player2 = player('Player 2', 'O');
  const both = [player1, player2];

  const active = () => {
    return both[0];
  }

  const switchPlayer = () => {
    both.reverse();
  }

  return { both, player1, player2, active, switchPlayer }
})()

const gameLogic = (() => {
  const fillSquare = (e) => {
    let [idx1, idx2] = e.target.dataset.key;
    if (gameboard.board[idx1][idx2] === '') {
      gameboard.board[idx1][idx2] = players.active().mark;
    } else {
      return;
    }
    players.switchPlayer();
    displayController.displayBoard();
    //UNCOUPLE DISPLAY FROM HERE MAYBE
  }

  return { fillSquare }
})()


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

