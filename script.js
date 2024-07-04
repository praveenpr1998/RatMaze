document.addEventListener("DOMContentLoaded", () => {
  const mazeContainer = document.getElementById("maze");
  const message = document.getElementById("message");
  const sizeInput = document.getElementById("size");
  const wallsInput = document.getElementById("walls");
  const generateButton = document.getElementById("generate");
  const startButton = document.getElementById("start");
  const pauseButton = document.getElementById("pause");
  const resetButton = document.getElementById("reset");

  let maze = [];
  let ratPosition = { row: 0, col: 0 };
  let endPosition = { row: 0, col: 0 };
  let interval;
  let paused = false;
  let maxWalls;

  //   Based on the input size(n*n) create the initial start(0,0)
  // and end position (n-1,n-1)

  //   Set the initial rat pos as start
  const generateMaze = () => {
    const size = parseInt(sizeInput.value);
    maxWalls = Math.floor(size * size - 2); // Set maximum walls based on maze size
    let walls = parseInt(wallsInput.value);

    if (walls > maxWalls) {
      walls = maxWalls;
      wallsInput.value = maxWalls;
    }

    // updating the css grid cells
    mazeContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    mazeContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    mazeContainer.innerHTML = "";
    maze = Array.from({ length: size }, () => Array(size).fill(0));
    ratPosition = { row: 0, col: 0 };
    endPosition = { row: size - 1, col: size - 1 };
    maze[0][0] = "S";
    maze[size - 1][size - 1] = "E";

    // 	Create a random row and col index
    // Where the indices should not be  1 and start and end

    let placedWalls = 0;
    while (placedWalls < walls) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (
        (row !== 0 || col !== 0) &&
        (row !== size - 1 || col !== size - 1) &&
        maze[row][col] === 0
      ) {
        maze[row][col] = 1;
        placedWalls++;
      }
    }
    drawMaze();
    generateButton.classList.remove("disabled");
    startButton.classList.remove("disabled");
    resetButton.classList.add("disabled");
    pauseButton.classList.add("disabled");
  };

  //   Based on the value of maze[I][j]
  // this will create element and its styles
  // 0 -> empty grid
  // 1 -> blocked wall
  // [0][0] = > start grid
  // [n-1][n-1] -> end grid
  const drawMaze = () => {
    mazeContainer.innerHTML = "";
    maze.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const div = document.createElement("div");
        div.classList.add("cell");
        if (cell === "S") div.classList.add("start");
        else if (cell === "E") div.classList.add("end");
        else if (cell === 1) div.classList.add("wall");
        if (rowIndex === ratPosition.row && colIndex === ratPosition.col) {
          div.classList.add("rat");
        }
        mazeContainer.appendChild(div);
      });
    });
  };

  const solveMaze = () => {
    // A move can be done in 4 possible ways
    const directions = [
      { row: 0, col: 1 }, // right
      { row: 1, col: 0 }, // down
      { row: 0, col: -1 }, // left
      { row: -1, col: 0 }, // up
    ];
    const stack = [{ ...ratPosition, visited: true }];
    const visited = new Set();
    visited.add(`${ratPosition.row},${ratPosition.col}`);

    const move = () => {
      // Checks to be made
      // -> if passed don’t run

      // -> if current pos is end[n-1][n-1] return as victory

      // -> if stack which keeps the route came is 0
      // ( which means it tried all possible 4 directions
      // and none satisfies the valid move) -> No Solution found

      // -> loop through possible directions and check for a valid move
      //   -> if valid -> update the current rat position, visited Set

      if (paused) return;
      if (stack.length === 0) {
        message.textContent = "Uh oh! The rat is lost";
        message.classList.remove("success-message");
        message.classList.add("error-message");
        clearInterval(interval);
        generateButton.classList.remove("disabled");
        startButton.classList.remove("disabled");
        resetButton.classList.remove("disabled");
        pauseButton.classList.add("disabled");
        return;
      }
      const current = stack.pop();
      const { row, col } = current;

      if (row === endPosition.row && col === endPosition.col) {
        message.textContent = "Victory! The rat found the way!";
        message.classList.remove("error-message");
        message.classList.add("success-message");
        clearInterval(interval);
        generateButton.classList.remove("disabled");
        startButton.classList.remove("disabled");
        resetButton.classList.remove("disabled");
        pauseButton.classList.add("disabled");
        return;
      }

      for (const direction of directions) {
        const newRow = row + direction.row;
        const newCol = col + direction.col;
        const posKey = `${newRow},${newCol}`;
        if (isValidMove(newRow, newCol, visited)) {
          stack.push({ row: newRow, col: newCol, visited: true });
          visited.add(posKey);
          updateCell(ratPosition.row, ratPosition.col, false); // Remove rat from current position
          ratPosition = { row: newRow, col: newCol };
          updateCell(newRow, newCol, true); // Add rat to new position
          break;
        }
      }
    };

    // an interval to call the move every 2 seconds

    interval = setInterval(move, 2000);
  };

  const isValidMove = (row, col, visited) => {
    return (
      row >= 0 &&
      col >= 0 &&
      row < maze.length &&
      col < maze.length &&
      maze[row][col] !== 1 &&
      !visited.has(`${row},${col}`)
    );
  };

  const updateCell = (row, col, isRat) => {
    const index = row * maze.length + col;
    const cell = mazeContainer.children[index];
    if (isRat) {
      cell.classList.add("rat");
    } else {
      cell.classList.remove("rat");
    }
  };

  generateButton.addEventListener("click", generateMaze);
  startButton.addEventListener("click", () => {
    paused = false;
    message.textContent = "";
    message.classList.remove("error-message", "success-message"); // Clear previous message classes
    generateButton.classList.add("disabled");
    startButton.classList.add("disabled");
    resetButton.classList.remove("disabled");
    pauseButton.classList.remove("disabled");
    ratPosition = { row: 0, col: 0 };
    solveMaze();
  });
  pauseButton.addEventListener("click", () => {
    paused = true;
  });
  resetButton.addEventListener("click", () => {
    clearInterval(interval);
    message.textContent = "";
    message.classList.remove("error-message", "success-message");
    generateButton.classList.remove("disabled");
    startButton.classList.remove("disabled");
    resetButton.classList.add("disabled");
    pauseButton.classList.add("disabled");
    ratPosition = { row: 0, col: 0 };
    updateCell(ratPosition.row, ratPosition.col, false);
    drawMaze();
  });

  generateMaze(); // Initial  generation
});
