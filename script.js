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

  const resetBoard = () => {
    board = [['', '', ''],['', '', ''],['', '', '']];
  }
  return { getBoard, resetBoard }
})()

const createPlayer = function({ name, symbol, number }) {
  return { name, symbol, number }
}
 
const players = (() => {
  let player1;
  let player2;
  let both;
  
  const setPlayer1 = ({name, symbol}) => { 
    player1 = createPlayer({name, symbol, number: 1});
  }

  const setPlayer2 = ({name, symbol}) => { 
    player2 = createPlayer({name, symbol, number: 2});
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
    players.setBothPlayers();
    eventObserver.run('players set'); // Run functions attached to players being set
    elementSelector.playerForm.reset;
    elementSelector.formOverlay.classList.add('close-form');
    displayController.activePlayer(); //Set active player at start
  }

  return { savePlayers }
})();

const gameLogic = (() => {
  let turns = 0;

  const fillSquare = (e) => {
    const coords = e.target.dataset.key;
    let [idx1, idx2] = coords;
    if (gameboard.getBoard()[idx1][idx2] === '') {
      gameboard.getBoard()[idx1][idx2] = players.active().symbol;
      addToTurn();
      // Run functions signed up to Check win, Check Draw and Update Board
      // Save a little time (don't need to check win before 5 moves)
      if (turns > 4) eventObserver.run('check win', coords, players.active().symbol);
      eventObserver.run('update board');
      eventObserver.run('check draw');
    } else {
      return;
    }
  }

  const addToTurn = () => {
    turns++;
    console.log(turns)
  }

  const isDraw = () => {
    return turns >= 9;
  }

  const hasDrawn = () => {
    if (isDraw()) displayController.displayEndGame("It was a draw.");
  }

  const hasWon = (coords, playerSymbol) => {
    if (checkWin(coords, playerSymbol)) {
      turns = 0; // Reset so as to not also trigger draw
      displayController.displayEndGame("Congratulations! You win ", players.active().name);
    }
  }

  const checkWin = (coords, playerSymbol) => {
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

  const newGame = () => {
    location.reload();
  }

  const rematch = () => {
    gameboard.resetBoard();
    turns = 0;
    displayController.displayBoard();
    elementSelector.endgameOverlay.classList.remove('open-endgame-overlay');
  }

  return { fillSquare, hasWon, newGame, rematch, isDraw, hasDrawn }
})()


const elementSelector = (() => {
  const squares = document.querySelectorAll('.square');
  const twoPlayerForm = document.querySelector('#twoPlayerForm');
  const singlePlayerForm = document.querySelector('#singlePlayerForm');
  const startgameOverlay = document.querySelector('.startgame-overlay');
  const twoPlayerFormOverlay = document.querySelector('.twoPlayerForm-overlay');
  const singlePlayerFormOverlay = document.querySelector('.singlePlayerForm-overlay');
  const endgameOverlay = document.querySelector('.endgame-overlay');
  const compBtn = document.querySelector('#comp-btn');
  const friendBtn = document.querySelector('#friend-btn');
  const playBtn = document.querySelector('#play-btn');
  const rematchBtn = document.querySelector('#rematch-btn');
  const player1Info = document.querySelector('.player1-info');
  const player2Info = document.querySelector('.player2-info');
  const endgameText = document.querySelector('.endgame-text');
  let player1Name;
  let player2Name;
  
  return { squares, twoPlayerForm, twoPlayerFormOverlay, endgameOverlay, playBtn, player1Info,
           player2Info, endgameText, rematchBtn, player1Name, player2Name,
           startgameOverlay, compBtn, friendBtn, singlePlayerFormOverlay, singlePlayerForm }
})()

// Module for Displaying DOM elements
const displayController = (() => {
  const displayBoard = () => {
    const squares = elementSelector.squares;
    squares.forEach(square => {
      let [idx1, idx2] = square.dataset.key.split('');
      square.innerHTML = gameboard.getBoard()[idx1][idx2];
    });
  }
  
  const displayEndGame = (text, player) => {
    elementSelector.endgameOverlay.classList.add('open-endgame-overlay');
    elementSelector.endgameText.innerHTML = `${text} ${player || ""}`;
  }
  
  const activePlayer = () => {
    elementSelector.player1Name = document.querySelector('.player1-name');
    elementSelector.player2Name = document.querySelector('.player2-name');
    
    if (players.active().number === 1) {
      elementSelector.player1Name.classList.add('active-player');
      elementSelector.player2Name.classList.remove('active-player');
    } else {
      elementSelector.player2Name.classList.add('active-player');
      elementSelector.player1Name.classList.remove('active-player');
    }
  }
  
  const displayPlayerInfo = () => {
    elementSelector.player1Info.innerHTML = 
    `<p class="player1-name">${players.getPlayer1().name}</p><p class="player1-symbol">${players.getPlayer1().symbol}</p>`
    elementSelector.player2Info.innerHTML = 
    `<p class="player2-name">${players.getPlayer2().name}</p><p class="player2-symbol">${players.getPlayer2().symbol}</p>`
  }
  
  const displayTwoPlayerForm = () => {
    elementSelector.startgameOverlay.classList.add('close-overlay');
    elementSelector.twoPlayerFormOverlay.classList.add('open-form-overlay');
  }

  const displaySinglePlayerForm = () => {
    elementSelector.startgameOverlay.classList.add('close-overlay');
    elementSelector.singlePlayerFormOverlay.classList.add('open-SinglePlayerForm-overlay');
  }
  
  return { displayBoard, displayEndGame, activePlayer, displayPlayerInfo, displayTwoPlayerForm,
           displaySinglePlayerForm }
})()

// Module for adding listener events
const interactionListener = (() => {
  // Board squares
  elementSelector.squares.forEach(square => {
    square.addEventListener('click', gameLogic.fillSquare);
  });

  // Selection of play vs friend
  elementSelector.friendBtn.addEventListener('click', displayController.displayTwoPlayerForm);

  // Selection of play vs comp
  elementSelector.compBtn.addEventListener('click', displayController.displaySinglePlayerForm);

  // Two Player Form Submit
  elementSelector.twoPlayerForm.addEventListener('submit', gameSetup.savePlayers);

  // Single Player Form Submit
  elementSelector.singlePlayerForm.addEventListener('submit', gameSetup.saveSinglePlayer);

  // Play Again Btn
  elementSelector.playBtn.addEventListener('click', gameLogic.newGame);

  // Rematch Btn
  elementSelector.rematchBtn.addEventListener('click', gameLogic.rematch);
})()

const gameEngine = (() => {
  // Subscribe functions to Event Observer to be run later
  eventObserver.subscribe('check win', gameLogic.hasWon) //Check for win after each successful move
  eventObserver.subscribe('check draw', gameLogic.hasDrawn) // Check for draw and display endgame
  eventObserver.subscribe('update board', players.switchPlayer); // Switch player after successful move
  eventObserver.subscribe('update board', displayController.activePlayer) // Show active player
  eventObserver.subscribe('update board', displayController.displayBoard) // Re-render board after each turn
  eventObserver.subscribe('players set', displayController.displayPlayerInfo) // Display plyer once player's are set
  
  //  TESTING
  // players.setPlayer1({name: 'Ben', symbol: 'X'})
  // players.setPlayer2({name: 'Emma', symbol: 'O'})
  // players.setBothPlayers();
  // displayController.activePlayer();
  // TESTING
  
  displayController.displayBoard();
})()

// ADD AI
