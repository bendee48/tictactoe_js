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
  let player1;
  let player2;
  let both;
  
  const setPlayer1 = ({name, symbol}) => { 
    player1 = createPlayer({name, symbol});
  }

  const setPlayer2 = ({name, symbol}) => { 
    player2 = createPlayer({name, symbol});
  }

  const getPlayer1 = () => {
    return player1;
  }

  const getPlayer2 = () => {
    return player2;
  }

  const setBothPlayers = () => {
    return both = [player1, player2];
  }

  const active = () => {
    return both[0];
  }

  const switchPlayer = () => {
    both.reverse();
  }

  return { getPlayer1, setPlayer1, setPlayer2, getPlayer2, active, switchPlayer, setBothPlayers }
})()

const gameSetup = (() => {
  const savePlayers = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    players.setPlayer1({name: data.get('player1'), symbol: data.get('symbol')});
    let player2Sym = data.get('symbol') === 'O' ? 'X' : 'O';
    players.setPlayer2({name: data.get('player2'), symbol: player2Sym});
    players.setBothPlayers()
    // Decouple ??
    elementSelector.playerForm.reset;
    elementSelector.formOverlay.classList.add('close-form');
  }

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

  const playAgain = () => {
    location.reload();
  }

  return { fillSquare, hasWon, playAgain }
})()


const elementSelector = (() => {
  const squares = document.querySelectorAll('.square');
  const playerForm = document.querySelector('#playerForm');
  const formOverlay = document.querySelector('.form-overlay');
  const winOverlay = document.querySelector('.win-overlay');
  const playBtn = document.querySelector('#play-btn');
  
  return { squares, playerForm, formOverlay, winOverlay, playBtn }
})()


const interactionListener = (() => {
  // Board squares
  elementSelector.squares.forEach(square => {
    square.addEventListener('click', gameLogic.fillSquare);
  });

  // Player Form Submit
  elementSelector.playerForm.addEventListener('submit', gameSetup.savePlayers);

  // Play Again Btn
  elementSelector.playBtn.addEventListener('click', gameLogic.playAgain);
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
    elementSelector.winOverlay.classList.add('open-win-overlay');
  }
  
  return { displayBoard, displayWin }
})()


const gameEngine = (() => {
  displayController.displayBoard();
  // Subscribe functions to Event Observer to be run later
  eventObserver.subscribe('check win', gameLogic.hasWon) //Check for win after each successful move
  eventObserver.subscribe('update board', players.switchPlayer); // Switch player after successful move
  eventObserver.subscribe('update board', displayController.displayBoard) // Re-render board after each turn
  
  //  TESTING
  // players.setPlayer1({name: 'Ben', symbol: 'X'})
  // players.setPlayer2({name: 'Emma', symbol: 'O'})
  // players.setBothPlayers();
})()


