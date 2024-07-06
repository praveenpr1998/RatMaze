const { START, END, LOST_MESSAGE, WON_MESSAGE } = TEXT_CONSTANTS;
document.addEventListener("DOMContentLoaded", () => {
  const {
    message,
    size: sizeInput,
    walls: wallsInput,
    generate: generateButton,
    start: startButton,
    pause: pauseButton,
    play: playButton,
    reset: resetButton,
    maze: mazeContainer,
  } = getElementsByIds([
    "message",
    "size",
    "walls",
    "generate",
    "start",
    "pause",
    "play",
    "reset",
    "maze",
  ]);
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
    maze[0][0] = START;
    maze[size - 1][size - 1] = END;

    // 	Create a random row and col index
    // Where the indices should not be  1 and start and end

    let placedWalls = 0;
    while (placedWalls < walls) {
      const row = getRandomNumber(size);
      const col = getRandomNumber(size);
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
    manageClasses([
      { element: generateButton, removeClasses: ["disabled"] },
      { element: startButton, removeClasses: ["disabled"] },
      { element: resetButton, addClasses: ["disabled"] },
      { element: pauseButton, addClasses: ["disabled"] },
      { element: playButton, addClasses: ["disabled"] },
    ]);
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
        if (cell === START) div.classList.add("start");
        else if (cell === END) div.classList.add("end");
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
        message.textContent = LOST_MESSAGE;
        manageClasses([
          { element: message, removeClasses: ["success-message"] },
          { element: message, addClasses: ["error-message"] },
        ]);
        clearInterval(interval);
        manageClasses([
          { element: generateButton, removeClasses: ["disabled"] },
          { element: startButton, removeClasses: ["disabled"] },
          { element: resetButton, removeClasses: ["disabled"] },
          { element: pauseButton, addClasses: ["disabled"] },
        ]);

        return;
      }
      const current = stack.pop();
      const { row, col } = current;

      if (row === endPosition.row && col === endPosition.col) {
        message.textContent = WON_MESSAGE;
        manageClasses([
          { element: message, removeClasses: ["error-message"] },
          { element: message, addClasses: ["success-message"] },
        ]);

        clearInterval(interval);
        manageClasses([
          { element: generateButton, removeClasses: ["disabled"] },
          { element: startButton, removeClasses: ["disabled"] },
          { element: resetButton, removeClasses: ["disabled"] },
          { element: pauseButton, addClasses: ["disabled"] },
        ]);

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
    manageClasses([
      { element: message, removeClasses: ["error-message", "success-message"] },
      { element: generateButton, addClasses: ["disabled"] },
      { element: startButton, addClasses: ["disabled"] },
      { element: resetButton, removeClasses: ["disabled"] },
      { element: pauseButton, removeClasses: ["disabled"] },
    ]);

    ratPosition = { row: 0, col: 0 };
    solveMaze();
  });
  pauseButton.addEventListener("click", () => {
    paused = true;
    manageClasses([
      { element: pauseButton, addClasses: ["disabled"] },
      { element: playButton, removeClasses: ["disabled"] },
    ]);
  });

  playButton.addEventListener("click", () => {
    paused = false;
    manageClasses([
      { element: playButton, addClasses: ["disabled"] },
      { element: pauseButton, removeClasses: ["disabled"] },
    ]);
  });

  resetButton.addEventListener("click", () => {
    clearInterval(interval);
    message.textContent = "";
    manageClasses([
      { element: message, removeClasses: ["error-message", "success-message"] },
      { element: generateButton, removeClasses: ["disabled"] },
      { element: startButton, removeClasses: ["disabled"] },
      { element: resetButton, addClasses: ["disabled"] },
      { element: pauseButton, addClasses: ["disabled"] },
    ]);

    ratPosition = { row: 0, col: 0 };
    updateCell(ratPosition.row, ratPosition.col, false);
    drawMaze();
  });

  generateMaze(); // Initial  generation
});
