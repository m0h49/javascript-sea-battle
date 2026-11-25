class Ship {
  constructor(name, length, isVertical) {
    this._name = name;
    this._length = Number(length);
    this._isVertical = Number(isVertical) === 1 ? 1 : 0;
    this._hits = new Array(this._length).fill(false); //[false][false][false]...
    this._startPosition = {
      x: null,
      y: null,
    };
  }

  get name() {
    return this._name;
  }
  set name(name) {
    this._name = name;
  }

  get length() {
    return this._length;
  }
  set length(length) {
    this._length = Number(length);
    this._hits = new Array(this._length).fill(false);
  }

  get hits() {
    return this._hits;
  }
  set hits(hitsArray) {
    this._hits = [...hitsArray];
  }

  get startPosition() {
    return this._startPosition;
  }
  set startPosition(positionObj) {
    this._startPosition = {
      x: positionObj.x,
      y: positionObj.y,
    };
  }

  get x() {
    return this._startPosition.x;
  }
  set x(x) {
    this._startPosition.x = x;
  }

  get y() {
    return this._startPosition.y;
  }
  set y(y) {
    this._startPosition.y = y;
  }

  get isVertical() {
    return this._isVertical;
  }
  set isVertical(value) {
    this._isVertical = Number(value) === 1 ? 1 : 0;
  }

  hit(index) {
    if (index >= 0 && index < this.length) {
      this._hits[index] = true;
      return true;
    }
    return false;
  }

  isSunk() {
    return this._hits.every((hit) => hit);
  }
}

class Board {
  constructor(size) {
    this._size = Number(size);
    this._grid = new Array(this._size)
      .fill(null)
      .map(() => new Array(this._size).fill(null));
    this._ships = [];
  }

  get size() {
    return this._size;
  }
  set size(size) {
    this._size = Number(size);
    this._grid = new Array(this._size)
      .fill(null)
      .map(() => new Array(this._size).fill(null));
    this._ships = [];
  }

  get ships() {
    return this._ships;
  }
  set ships(shipsArray) {
    this._ships = shipsArray;
  }

  get grid() {
    return this._grid;
  }
  set grid(gridArray) {
    this._grid = gridArray;
  }

  isInside(x, y) {
    return (
      Number.isInteger(x) &&
      Number.isInteger(y) &&
      x >= 0 &&
      y >= 0 &&
      x < this._size &&
      y < this._size
    );
  }

  placeShip(ship, x, y) {
    if (!(ship instanceof Ship)) {
      return false;
    }
    const endX = ship.isVertical === 1 ? x : x + ship.length - 1;
    const endY = ship.isVertical === 1 ? y + ship.length - 1 : y;

    if (!this.isInside(x, y) || !this.isInside(endX, endY)) {
      return false;
    }

    for (let i = 0; i < ship.length; i++) {
      const cellX = ship.isVertical ? x : x + i;
      const cellY = ship.isVertical ? y + i : y;

      if (this.grid[cellY][cellX] !== null) {
        return false;
      }
    }

    ship.startPosition = { x, y };

    if (ship.isVertical) {
      for (let i = 0; i < ship.length; i++) {
        this.grid[y + i][x] = ship;
      }
    } else {
      for (let i = 0; i < ship.length; i++) {
        this.grid[y][x + i] = ship;
      }
    }

    this.ships.push(ship);
    return true;
  }

  findAvailableCells() {
    const availableCells = [];

    for (let row = 0; row < this._size; row++) {
      for (let column = 0; column < this._size; column++) {
        if (this.grid[row][column] === null) {
          availableCells.push({ x: column, y: row });
        }
      }
    }
    return availableCells;
  }

  receiveAttack(x, y) {
    if (!this.isInside(x, y)) {
      return false;
    }

    const targetShip = this.grid[y][x];
    if (targetShip instanceof Ship) {
      const hitIndex = targetShip.isVertical
        ? y - targetShip.startPosition.y
        : x - targetShip.startPosition.x;

      targetShip.hit(hitIndex);
      return true;
    }
    return false;
  }

  display() {
    for (let y = 0; y < this._size; y++) {
      const row = [];

      for (let x = 0; x < this._size; x++) {
        const ship = this.grid[y][x];

        if (!(ship instanceof Ship)) {
          row.push("O");
          continue;
        }

        const hitIndex = ship.isVertical
          ? y - ship.startPosition.y
          : x - ship.startPosition.x;
        row.push(ship.hits[hitIndex] ? "X" : "S");
      }

      console.log(y, row.join(" "));
    }
  }
}

class Player {
  constructor(name, boardSize) {
    this._name = name;
    this._boardSize = boardSize;

    this._board = new Board(boardSize);
  }

  get name() {
    return this._name;
  }
  set name(name) {
    this._name = name;
  }

  get boardSize() {
    return this._boardSize;
  }
  set boardSize(size) {
    this._board = new Board(size);
    this._boardSize = this._board.size;
  }

  get board() {
    return this._board;
  }

  placeShips(shipName, length, isVertical, startPosition) {
    if (!startPosition) {
      return null;
    }
    const playerShip = new Ship(shipName, length, isVertical);

    const isPlacedSuccessfully = this._board.placeShip(
      playerShip,
      startPosition.x,
      startPosition.y,
    );
    if (!isPlacedSuccessfully) {
      return null;
    }

    return playerShip;
  }

  async takeTurn(opponent) {
    while (true) {
      const inputPlayer = prompt(
        `${this.name}, введите координаты атаки (x,y):`,
        "0,0",
      );

      if (inputPlayer === null) {
        return null;
      }

      const parts = inputPlayer.split(",");
      if (parts.length !== 2) {
        continue;
      }

      const column = Number(parts[0]);
      const row = Number(parts[1]);

      if (!Number.isInteger(row) || !Number.isInteger(column)) {
        continue;
      }

      if (!opponent.board.isInside(column, row)) {
        continue;
      }

      return {
        x: column,
        y: row,
        opponent,
      };
    }
  }
}

class HumanPlayer extends Player {
  placeShips(shipName, length, isVertical, startPosition) {
    return super.placeShips(shipName, length, isVertical, startPosition);
  }

  async takeTurn(opponent) {
    const attack = await super.takeTurn(opponent);
    return attack;
  }
}

class AIPlayer extends Player {
  constructor(name, boardSize) {
    super(name, boardSize);
    this._attackedCells = new Set();
  }

  placeShips(shipName, length, isVertical, startPosition) {
    const finalLength = length ?? Math.floor(Math.random() * 3) + 1;

    const randomOrientation = Math.round(Math.random());
    const orientations =
      isVertical != null
        ? [isVertical]
        : [randomOrientation, randomOrientation === 1 ? 0 : 1];

    const cells =
      startPosition != null
        ? [startPosition]
        : this.board.findAvailableCells().sort(() => Math.random() - 0.5);

    for (const orientation of orientations) {
      for (const cell of cells) {
        const ship = super.placeShips(
          `${this.name} ${shipName}`,
          finalLength,
          orientation,
          cell,
        );

        if (ship) {
          return ship;
        }
      }
    }

    return null;
  }

  async takeTurn(opponent) {
    const availableCells = [];

    for (let row = 0; row < opponent.board.size; row++) {
      for (let column = 0; column < opponent.board.size; column++) {
        if (!this._attackedCells.has(`${column},${row}`)) {
          availableCells.push({ x: column, y: row });
        }
      }
    }

    if (availableCells.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const cell = availableCells[randomIndex];
    this._attackedCells.add(`${cell.x},${cell.y}`);

    return { x: cell.x, y: cell.y, opponent };
  }
}

class App {
  constructor(boardSize, maxShipLength, shipCount) {
    this._boardSize = boardSize;
    this._maxShipLength = maxShipLength;
    this._shipCount = shipCount;

    this.firstPlayer = null;
    this.secondPlayer = null;
  }

  get boardSize() {
    return this._boardSize;
  }
  set boardSize(boardSize) {
    this._boardSize = boardSize;
  }

  get maxShipLength() {
    return this._maxShipLength;
  }
  set maxShipLength(maxShipLength) {
    this._maxShipLength = maxShipLength;
  }

  get shipCount() {
    return this._shipCount;
  }
  set shipCount(shipCount) {
    this._shipCount = shipCount;
  }

  shipArrangement(player, shipCount, maxShipLength) {
    if (player instanceof AIPlayer) {
      for (let i = 0; i < shipCount; i++) {
        if (!player.placeShips("AIShip")) return null;
      }

      return player.board.ships.map(
        (ship) =>
          `${player.name} ${shipCount} ${ship.length} ${ship.startPosition.x},${ship.startPosition.y} ${ship.isVertical}`,
      );
    }

    const successfulInputs = [];
    for (let i = 0; i < shipCount; i++) {
      let placedShip = null;

      while (placedShip === null) {
        const shipInput = prompt(
          `${player.name}, корабль ${i + 1}: длину до ${maxShipLength}, 
          координату старта (x,y), расположение (1 - верт., 0 - гор.):,`,
          `${Math.min(maxShipLength, 3)} 0,0 0`,
        );

        if (shipInput === null) {
          return null;
        }
        const parts = shipInput.trim().split(/\s+/);

        if (parts.length !== 3) {
          continue;
        }
        const [shipLengthStr, startPositionStr, isVerticalStr] = parts;
        const coordinates = startPositionStr.split(",");
        if (coordinates.length !== 2) {
          continue;
        }

        const shipLength = Number(shipLengthStr);
        if (
          !Number.isInteger(shipLength) ||
          shipLength < 1 ||
          shipLength > maxShipLength
        ) {
          continue;
        }

        const isVertical = Number(isVerticalStr);
        if (isVertical !== 0 && isVertical !== 1) {
          continue;
        }

        const [xPosition, yPosition] = coordinates.map(Number);
        if (!Number.isInteger(xPosition) || !Number.isInteger(yPosition)) {
          continue;
        }

        placedShip = player.placeShips("Ship", shipLength, isVertical, {
          x: xPosition,
          y: yPosition,
        });

        if (placedShip) {
          successfulInputs.push(
            `${player.name} ${shipCount} ${placedShip.length} ${placedShip.startPosition.x},${placedShip.startPosition.y} ${placedShip.isVertical}`,
          );
        }
      }
    }
    return successfulInputs;
  }

  async run() {
    const opponentType = prompt(
      "Играть: 1 - с человеком, 0 - c компьютером, 2 - компьютер с компьютером",
      "2",
    );
    if (opponentType === null) {
      return null;
    }

    const firstPlayer = prompt(
      "First Player: имя игрока",
      Number(opponentType) !== 2 ? "Max" : "AIMax",
    );
    if (firstPlayer === null) {
      return null;
    }

    if (Number(opponentType) !== 2) {
      this.firstPlayer = new HumanPlayer(firstPlayer, this.boardSize);
    } else {
      this.firstPlayer = new AIPlayer(firstPlayer, this.boardSize);
    }
    const p1Inputs = this.shipArrangement(
      this.firstPlayer,
      this.shipCount,
      this.maxShipLength,
    );
    if (p1Inputs === null) {
      return null;
    }

    const secondPlayer = prompt(
      "Second Player: имя игрока",
      Number(opponentType) === 1 ? "Alex" : "AIAlex",
    );
    if (secondPlayer === null) {
      return null;
    }

    if (Number(opponentType) === 1) {
      this.secondPlayer = new HumanPlayer(secondPlayer, this.boardSize);
    } else {
      this.secondPlayer = new AIPlayer(secondPlayer, this.boardSize);
    }
    const p2Inputs = this.shipArrangement(
      this.secondPlayer,
      this.shipCount,
      this.maxShipLength,
    );
    if (p2Inputs === null) {
      return null;
    }

    const winner = await this.playGame();

    if (!winner) {
      return null;
    }

    return {
      player1Inputs: p1Inputs,
      player2Inputs: p2Inputs,
      winnerName: winner.name,
    };
  }

  async playGame() {
    let currentPlayer = this.firstPlayer;
    let opponent = this.secondPlayer;

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const attack = await currentPlayer.takeTurn(opponent);
      if (!attack) {
        return null;
      }

      opponent.board.receiveAttack(attack.x, attack.y);
      const allSunk =
        opponent.board.ships.length > 0 &&
        opponent.board.ships.every((ship) => ship.isSunk());

      console.log(`${currentPlayer.name} (${attack.x},${attack.y})`);
      currentPlayer.board.display();
      console.log("-----(opponent V )-----");
      opponent.board.display();

      if (allSunk) {
        return currentPlayer;
      }

      [currentPlayer, opponent] = [opponent, currentPlayer];
    }
  }
}
