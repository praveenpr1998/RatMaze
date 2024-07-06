**HTML Structure:**

**Inputs:**

* Max size of matrix
* Number of blocked walls

**Buttons:**

* Generate Maze
* Start
* Pause
* Play
* Reset

**JavaScript Logic:**

**Functions Needed:**

* GenerateMaze
* DrawMaze
* SolveMaze
* moveRat
* ResetGame

**Function Details:**

* **GenerateMaze**
Create an initial maze based on the input size (n \* n).
Set the start position at (0, 0) and the end position at (n-1, n-1).
Set the initial rat position to the start.
In a loop with a range of blocked walls:
Generate random row and column indices.
Ensure indices are not (1, start) or the end.
This will create a maze 2D array with walls, start, end, and initial rat position.


* **DrawMaze**
Based on the value of maze[i][j], create elements with appropriate styles:
0 -> empty grid
1 -> blocked wall
[0][0] -> start grid
[n-1][n-1] -> end grid


* **SolveMaze**
A move can be made in four possible ways: up, down, left, right.
Create an array with these possible direction indices.
Loop through this array to find the possible next step.
Create a visited set to keep track of all visited indices.
Create an interval to call the moveRat function every 2 seconds.


**moveRat**
Checks to be made:
If passed, don’t run.
If the current position is the end ([n-1][n-1]), return as victory.
If the stack (which keeps the route) is empty (i.e., all possible directions have been tried and none are valid), return "No Solution found".
Loop through possible directions and check for a valid move:
If valid, update the current rat position and the visited set.
By calling moveRat at intervals, the final outcome will be either "Won" or "No Solution".
