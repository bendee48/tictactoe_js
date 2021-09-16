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
    const coords = e.target.dataset.key;
    let [idx1, idx2] = coords;
    if (gameboard.board[idx1][idx2] === '') {
      gameboard.board[idx1][idx2] = players.active().mark;
    } else {
      return;
    }
    //MOve to game engine??? Maybe??! YAS DEFINITLEY OR SEPERATE FUNCTION
    if (win(coords, players.active().mark)) {
      console.log('WINNER WINNER CHICKEN DINNER!')
    }
    players.switchPlayer();
    displayController.displayBoard();
    //UNCOUPLE DISPLAY FROM HERE MAYBE
  }

  const win = (coords, playerMark) => {
    //CAN SKIP FIRST 4 turns save a little time
    // object showing winning moves from that square, check only those
    const winRows = { '00': [['00', '01', '02'], ['00', '11', '22'], ['00', '10', '20']],
                      '01': [['00', '01', '02'], ['01', '11', '21']],
                      '02': [['00', '01', '02'], ['02', '11', '20'], ['02', '12', '22']],
                      '10': [['00', '10', '20'], ['10', '11', '12'],],
                      '11': [['00', '11', '22'], ['02', '11', '20'], ['10', '11', '12'], ['01', '11', '21']],
                      '12': [['10', '11', '12'], ['02', '12', '22']],
                      '20': [['00', '10', '20'], ['02', '11', '20'], ['20', '21', '22']],
                      '21': [['01', '11', '21'], ['20', '21', '22']],
                      '22': [['00', '11', '22'], ['20', '21', '22'], ['02', '12', '22']] };
    const board = gameboard.board;

    // Check possible winning rows for active player's mark 
    return winRows[coords].some(row => {
      return row.every(coord => {
        let [idx1, idx2] = coord;
        return board[idx1][idx2] === playerMark;
      });
    });
  }

  return { fillSquare, win }
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
  //initialize save board here?? MEMOMIZE BABAY
  const displayBoard = () => {
    const squares = elementSelector.squares
    squares.forEach(square => {
      let [idx1, idx2] = square.dataset.key.split('');
      square.innerHTML = gameboard.board[idx1][idx2];
    });
  }
  
  return { displayBoard }
})()


const gameEngine = (() => {
  displayController.displayBoard();
})()

