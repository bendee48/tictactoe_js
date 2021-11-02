// Event Observer 
// Observer pattern to handle changes after events/ changes 
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

// Tictactoe Board
const gameboard = (() => {
  let board = [['', '', ''],['', '', ''],['', '', '']];
  
  const getBoard = () => {
    return board;
  }

  const resetBoard = () => {
    board = [['', '', ''],['', '', ''],['', '', '']];
    displayController.colourSquares();
  }
  return { getBoard, resetBoard }
})()

// Player Factory
const createPlayer = function({ name, symbol, number, ai=false }) {
  return { name, symbol, number, ai }
}

// Players Module
const players = (() => {
  let player1;
  let player2;
  let both;
  
  const setPlayer1 = ({name, symbol, ai}) => { 
    player1 = createPlayer({name, symbol, number: 1});
  }

  const setPlayer2 = ({name, symbol, ai}) => { 
    player2 = createPlayer({name, symbol, number: 2, ai});
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

// Game Setup Module
const gameSetup = (() => {
  const savePlayers = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    players.setPlayer1({name: data.get('player1'), symbol: data.get('symbol')});
    let player2Sym = data.get('symbol') === 'O' ? 'X' : 'O';
    if (e.target.id === "singlePlayerForm") {
      players.setPlayer2({name: 'Computer', symbol: player2Sym, ai: true});
    } else {
      players.setPlayer2({name: data.get('player2'), symbol: player2Sym});
    }
    _setDifficulty(data.get('difficulty'));
    players.setBothPlayers();
    eventObserver.run('players set'); // Run functions attached to players being set
    e.target.reset();
    e.target.parentNode.classList.add('close-form'); // Close form overlay
    displayController.activePlayer(); //Set active player at start
  }

  const _setDifficulty = (difficulty) => {
    if (difficulty === 'laura mode') {
      gameLogic.setDifficulty('laura mode');
    } else if (difficulty === 'easy') {
      gameLogic.setDifficulty('easy');
    } else if (difficulty === 'hard') {
      gameLogic.setDifficulty('hard');
    }
  }

  return { savePlayers }
})();

// Game Logic Module
const gameLogic = (() => {
  let turns = 0;
  let win = false;
  let difficulty;

  const setDifficulty = (newDifficulty) => {
    difficulty = newDifficulty;
  }

  const getDifficulty = () => {
    return difficulty;
  }

  const getWinStatus = () => {
    return win;
  }

  const fillSquare = (e, params, callback) => {
    let idx1, idx2;
    let coords;

    // Check if coords are from an event or provided via argument
    coords = params ? params : e.target.dataset.key;
    [idx1, idx2] = coords;

    if (gameboard.getBoard()[idx1][idx2] === '') {
      gameboard.getBoard()[idx1][idx2] = players.active().symbol;
      addToTurn();
      // Run functions signed up to Check win, Check Draw and Update Board
      // Save a little time (don't need to check win before 5 moves)
      if (turns > 4) eventObserver.run('check win', gameboard.getBoard(), players.active().symbol);
      eventObserver.run('update board');
      eventObserver.run('check draw');
      if (callback) callback();
    } else {
      return;
    }
  }

  const aiMove = () => {
    if (players.active().ai && turns < 9 && !win) { // !win check stops comp move after a player win
      eventObserver.run('disable board');
      let mode;
      if (getDifficulty() === 'laura mode') {
        mode = ai.lauraMode();
      } else if (getDifficulty() === 'easy') {
        mode = ai.easy();
      } else if (getDifficulty() === 'hard') {
        mode = ai.unbeatable(gameboard.getBoard(), players.active().symbol);
      }
      // Pass enableBoard as a callback to turn board back on
      setTimeout(fillSquare, 1350, null, mode, displayController.enableBoard)
    }
  }

  const addToTurn = () => {
    turns++;
  }

  const isDraw = () => {
    return turns >= 9;
  }

  const hasDrawn = () => {
    if (isDraw()) displayController.displayEndGame("It was a draw.");
  }

  const hasWon = (board, playerSymbol) => {
    let result = checkWin(board, playerSymbol);

    if (result) {
      displayController.colourWinners(result);
      turns = 0;
      win = true;
      setTimeout(displayController.displayEndGame, 2000, "Congratulations! You win ", players.active().name)
    }
  }

  const checkWin = (board, player) => {
    if (board[0][0] == player && board[0][1] == player && board[0][2] == player) {
      return [0,1,2];
    } else if (board[1][0] == player && board[1][1] == player && board[1][2] == player) {
      return [3,4,5];
    } else if (board[2][0] == player && board[2][1] == player && board[2][2] == player) {
      return [6,7,8];
    } else if (board[0][0] == player && board[1][0] == player && board[2][0] == player) {
      return [0,3,6];
    } else if (board[0][1] == player && board[1][1] == player && board[2][1] == player) {
      return [1,4,7];
    } else if (board[0][2] == player && board[1][2] == player && board[2][2] == player) {
      return [2,5,8];
    } else if (board[0][0] == player && board[1][1] == player && board[2][2] == player) {
      return [0,4,8];
    } else if (board[0][2] == player && board[1][1] == player && board[2][0] == player) {
      return [2,4,6];
    } else {
      return false;
    }
  }

  const availableSquares = (board) => {
    let spaces = [];
    board.forEach((row, idx1) => {
      row.forEach((sq, idx2) => {
        if (sq === "") spaces.push(`${idx1}${idx2}`);
      })
    });
    return spaces;
  }

  const newGame = () => {
    location.reload();
  }

  const rematch = () => {
    gameboard.resetBoard();
    turns = 0;
    win = false;
    displayController.displayBoard();
    displayController.activePlayer();
    elementSelector.endgameOverlay.classList.remove('open-endgame-overlay');
    gameLogic.aiMove(); // Comp will move first if it's active
  }

  return { fillSquare, hasWon, newGame, rematch, isDraw, hasDrawn, aiMove, checkWin, availableSquares,
           setDifficulty, getDifficulty, getWinStatus }
})()

// AI module for Computer moves
const ai = (()=> {
  // Very simple, choose next available space
  const lauraMode = () => {
    const board = gameboard.getBoard();
    let rowIndex;
    let elementindex;
  
    for (let i = 0; i < board.length; i++) {
      rowIndex = i;
      elementIndex = board[i].indexOf("");
      if (elementIndex >= 0) break;
    }

    // Return indices as string
    return `${rowIndex}${elementIndex}`;
  }

  const easy = () => {
    const board = gameboard.getBoard();
    let spaces = gameLogic.availableSquares(board);
    return spaces[Math.floor(Math.random() * spaces.length)];
  }

  const unbeatable = (board, playerSym) => {
    return minimax(board, playerSym).index;
  }
  
  // Minimax for unbeatable AI
  const minimax = (board, playerSym) => {
    // debugger
    let aiPlayer = players.getPlayer2().symbol;  //MEMOIZE
    let huPlayer = players.getPlayer1().symbol;  //MEMOIZE
    let squares = gameLogic.availableSquares(board);

    if (gameLogic.checkWin(board, aiPlayer)) {
      return { score: 1 }
    } else if (gameLogic.checkWin(board, huPlayer)) {
      return { score: -1 }
    } else if (squares.length === 0) {
      return { score: 0 };
    }

    let moves = [];
    // Move through availables spaces and call minimax again on updated board
    squares.forEach(sq => {
      let move = {};
      move.index = sq;
      let [idx1, idx2] = sq;
      board[idx1][idx2] = playerSym;

      if (playerSym === aiPlayer) {
        let result = minimax(board, huPlayer)
        move.score = result.score;
      } else {
        let result = minimax(board, aiPlayer)
        move.score = result.score;
      }
      // Reset baord at the end
      board[idx1][idx2] = "";
      moves.push(move);
    });

    let bestMove;
    // Choose highest score for ai player
    if (playerSym === aiPlayer){
      var bestScore = -10000;
      for (var i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      // and lowest score for human player
      var bestScore = 10000;
      for (var i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove];
  }

  return { lauraMode, unbeatable, easy };
})()

// Element Selector fo HTML elements
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
    if (!gameLogic.getWinStatus()) { // Don't update immediately at end game
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

  const disableBoard = () => {
    elementSelector.squares.forEach(sq => {
      sq.style.pointerEvents = "None";
    });
  }

  const enableBoard = () => {
    elementSelector.squares.forEach(sq => {
      sq.style.pointerEvents = "auto";
    });
  }

  const colourWinners = (result) => {
    let squares = Array.from(elementSelector.squares);
    result.forEach(num => {
      squares[num].classList.add('winner-square');
    })
  }

  const colourSquares = () => {
    elementSelector.squares.forEach(sq => {
      sq.classList.remove('winner-square');
    })
  }
  
  return { displayBoard, displayEndGame, activePlayer, displayPlayerInfo, displayTwoPlayerForm,
           displaySinglePlayerForm, disableBoard, enableBoard, colourWinners, colourSquares }
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
  elementSelector.singlePlayerForm.addEventListener('submit', gameSetup.savePlayers);

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
  eventObserver.subscribe('update board', displayController.displayBoard) // Re-render board
  eventObserver.subscribe('players set', displayController.displayPlayerInfo) // Display plyer once player's are set
  eventObserver.subscribe('update board', gameLogic.aiMove) // Make move via Ai if playing vs computer
  eventObserver.subscribe('disable board', displayController.disableBoard) // Disable board on AI's turn

  //  TESTING
  // players.setPlayer1({name: 'Ben', symbol: 'X'})
  // players.setPlayer2({name: 'Emma', symbol: 'O'})
  // players.setBothPlayers();
  // displayController.activePlayer();
  //  TESTING
  
  displayController.displayBoard();
})()
