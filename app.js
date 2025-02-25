const gameboard = (function () {
  const board = ["", "", "", "", "", "", "", "", ""]

  const getBoard = () => board
  const placeMarker = (index, marker) => {
    if (board[index] === "") {
      board[index] = marker
      return true
    }
    return false
  }
  const resetBoard = () => board.fill("")

  return { getBoard, placeMarker, resetBoard }
})()

function createPlayer(name, marker) {
  if (!name?.trim() || !marker?.trim()) {
    return null
  }
  const playerName = name
  const playerMarker = marker
  let playerScore = 0

  const getPlayerName = () => playerName
  const getPlayerMarker = () => playerMarker
  const getPlayerScore = () => playerScore
  const addPlayerScore = () => playerScore++
  const resetPlayerScore = () => (playerScore = 0)

  return { getPlayerName, getPlayerMarker, getPlayerScore, addPlayerScore, resetPlayerScore }
}

const gameController = (function () {
  const players = []

  let activePlayer
  const switchPlayerTurn = () => {
    activePlayer = activePlayer == players[0] ? players[1] : players[0]
  }
  const getActivePlayer = () => activePlayer

  const playRound = () => {
    const playerOne = createPlayer(prompt("Enter Player 1 name:"), "O")
    const playerTwo = createPlayer(prompt("Enter Player 2 name:"), "X")

    if (!playerOne || !playerTwo) return

    players.push(playerOne, playerTwo)
    activePlayer = players[0]
  }

  const board = gameboard.getBoard()
  const calculateWinner = (index) => {
    if (!gameboard.placeMarker(index, getActivePlayer().getPlayerMarker())) return false

    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        const winner = getActivePlayer()
        winner.addPlayerScore()
        return "win"
      }
    }

    if (board.includes("")) {
      switchPlayerTurn()
      return false
    }
    return "draw"
  }

  return { playRound, calculateWinner, getActivePlayer, players }
})()

const uiController = (function () {
  const mainMenu = document.querySelector("#main-menu")
  const mainGame = document.querySelector("#main-game")
  const playButton = document.querySelector("#play-button")
  const exitButton = document.querySelector("#exit-button")
  const gameboardTile = document.querySelectorAll("#gameboard-tile")

  const modal = document.querySelector("#modal")
  const modalButtonContainer = document.querySelector("#modal-button-container")
  const modalTextContainer = document.querySelector("#modal-text-container")

  const playerOneName = document.querySelector("#player-one-name")
  const playerTwoName = document.querySelector("#player-two-name")
  const playerOneScore = document.querySelector("#player-one-score")
  const playerTwoScore = document.querySelector("#player-two-score")

  const updateScreen = () => {
    const board = gameboard.getBoard()
    gameboardTile.forEach((tile) => {
      tile.innerHTML = ""
      for (let i = 0; i < board.length; i++) {
        if (tile.dataset.index == i) {
          const p = document.createElement("p")
          p.textContent = board[i]
          tile.appendChild(p)
        }
      }
    })

    const currentPlayer = gameController.getActivePlayer()
    const playerOneMarker = document.querySelector("#player-one-marker")
    const playerTwoMarker = document.querySelector("#player-two-marker")

    if (currentPlayer.getPlayerMarker() == "O") {
      playerTwoMarker.classList.remove("main-game__player-marker_active")
      playerOneMarker.classList.add("main-game__player-marker_active")
    } else {
      playerOneMarker.classList.remove("main-game__player-marker_active")
      playerTwoMarker.classList.add("main-game__player-marker_active")
    }

    playerOneScore.textContent = gameController.players[0].getPlayerScore()
    playerTwoScore.textContent = gameController.players[1].getPlayerScore()
  }

  const changeScreen = () => {
    if (gameController.players.length == 0) return

    playerOneName.textContent = gameController.players[0].getPlayerName()
    playerTwoName.textContent = gameController.players[1].getPlayerName()
    playerOneScore.textContent = gameController.players[0].getPlayerScore()
    playerTwoScore.textContent = gameController.players[1].getPlayerScore()
    mainMenu.style.display = "none"
    mainGame.style.display = "grid"
    updateScreen()
  }

  gameboardTile.forEach((tile) => {
    tile.addEventListener("click", () => {
      const gameState = gameController.calculateWinner(tile.dataset.index)
      if (gameState) {
        const h3 = document.createElement("h3")
        h3.textContent =
          gameState == "win" ? `${gameController.getActivePlayer().getPlayerName()} Win` : "Draw"
        modalTextContainer.appendChild(h3)

        const button = document.createElement("button")
        button.textContent = "Continue"
        button.addEventListener("click", () => {
          gameboard.resetBoard()
          modalTextContainer.innerHTML = ""
          modalButtonContainer.innerHTML = ""
          modal.style.display = "none"
          updateScreen()
        })
        modalButtonContainer.appendChild(button)
        modal.style.display = "grid"
      }
      updateScreen()
    })
  })

  playButton.addEventListener("click", () => {
    gameController.playRound()
    changeScreen()
  })

  exitButton.addEventListener("click", () => {
    gameboard.resetBoard()
    gameController.players.splice(0, gameController.players.length)
    mainMenu.style.display = "flex"
    mainGame.style.display = "none"
  })
})()
