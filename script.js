// Observer pattern to handle changes after event clicks 
const eventObserver = (() => {
  let subscriptions = {};

  const subscribe = (sub, func) => {
    if (subscriptions[sub]) {
      subscriptions[sub].push(func);
    } else {
      subscriptions[sub] = [func];
    }
  }

  const run = (sub, ...args) => {
    subscriptions[sub].forEach(func => {
      func.call(this, ...args)
    });
  }

  return { subscribe, subscriptions, run }
})()

const gameboard = (() => {
  let board = [['', '', ''],['', '', ''],['', '', '']];
  
  const getBoard = () => {
    return board;
  }
  return { getBoard }
})()

const createPlayer = function({ name, symbol }) {
  return { name, symbol }
}
 
const players = (() => {
  let player1 = createPlayer({name: 'Player 1', symbol: 'X'});
  let player2 = createPlayer({ name: 'Player 2', symbol: 'O'});
  let both = [player1, player2];

  const active = () => {
    return both[0];
  }

  const switchPlayer = () => {
    both.reverse();
  }

  return { player1, player2, active, switchPlayer }
})()

const gameSetup = (() => {
  const savePlayers = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
  }
  // IMPLEMENT FUNCTION STUFF 
  return { savePlayers }
})();

const gameLogic = (() => {
  const fillSquare = (e) => {
    const coords = e.target.dataset.key;
    let [idx1, idx2] = coords;
    if (gameboard.getBoard()[idx1][idx2] === '') {
      gameboard.getBoard()[idx1][idx2] = players.active().symbol;
      // Run functions signed up to Check win and Update Board
      eventObserver.run('check win', coords, players.active().symbol)
      eventObserver.run('update board')
    } else {
      return;
    }
  }

  const hasWon = (coords, playerSymbol) => {
    if (checkWin(coords, playerSymbol)) {
      displayController.displayWin();
    }
  }

  const checkWin = (coords, playerSymbol) => {
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
    const board = gameboard.getBoard();

    // Check possible winning rows for active player's mark 
    return winRows[coords].some(row => {
      return row.every(coord => {
        let [idx1, idx2] = coord;
        return board[idx1][idx2] === playerSymbol;
      });
    });
  }

  return { fillSquare, hasWon }
})()


const elementSelector = (() => {
  const squares = document.querySelectorAll('.square');
  const playerForm = document.querySelector('#playerForm');
  
  return { squares, playerForm }
})()


const interactionListener = (() => {
  // Board squares
  elementSelector.squares.forEach(square => {
    square.addEventListener('click', gameLogic.fillSquare);
  });

  elementSelector.playerForm.addEventListener('submit', gameSetup.savePlayers);
})()

const displayController = (() => {
  //initialize save board here?? MEMOMIZE BABAY
  const displayBoard = () => {
    const squares = elementSelector.squares
    squares.forEach(square => {
      let [idx1, idx2] = square.dataset.key.split('');
      square.innerHTML = gameboard.getBoard()[idx1][idx2];
    });
  }

  const displayWin = () => {
    console.log('WINNER')
  }
  
  return { displayBoard, displayWin }
})()


const gameEngine = (() => {
  displayController.displayBoard();
  // Subscribe functions to Event Observer to be run later
  eventObserver.subscribe('check win', gameLogic.hasWon) //Check for win after each successful move
  eventObserver.subscribe('update board', players.switchPlayer); // Switch player after successful move
  eventObserver.subscribe('update board', displayController.displayBoard) // Re-render board after each turn
})()


