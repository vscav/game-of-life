import { useCallback, useRef, useState } from "react";
import { produce } from "immer";
import "./App.css";

const numRows = 20;
const numCols = 20;

const generateGrid = (empty = true) => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(
      Array.from(Array(numCols), () =>
        empty ? 0 : Math.random() > 0.7 ? 1 : 0
      )
    );
  }

  return rows;
};

const getSurroundingCells = (x, y, matrix) => {
  const xLimit = matrix.length;
  if (xLimit === 0) return null;

  const yLimit = matrix[0].length;
  if (yLimit === 0) return null;

  return {
    topLeft: x - 1 >= 0 && y - 1 >= 0 ? matrix[x - 1][y - 1] : null,
    top: y - 1 >= 0 ? matrix[x][y - 1] : null,
    topRight: x + 1 < xLimit && y - 1 >= 0 ? matrix[x + 1][y - 1] : null,

    middleLeft: x - 1 >= 0 ? matrix[x - 1][y] : null,
    middleRight: x + 1 < xLimit ? matrix[x + 1][y] : null,

    bottomLeft: x - 1 >= 0 && y + 1 < yLimit ? matrix[x - 1][y + 1] : null,
    bottom: y + 1 < yLimit ? matrix[x][y + 1] : null,
    bottomRight: x + 1 < xLimit && y + 1 < yLimit ? matrix[x + 1][y + 1] : null,
  };
};

const generateNextGeneration = (currentGenerationGrid, gridDraft) => {
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const surroundingCells = getSurroundingCells(i, j, currentGenerationGrid);
      let aliveNeighbors = 0;

      for (const [, value] of Object.entries(surroundingCells)) {
        if (value != null) {
          aliveNeighbors += value;
        }
      }

      if (aliveNeighbors === 3) {
        gridDraft[i][j] = 1;
      } else if (aliveNeighbors < 2 || aliveNeighbors > 3) {
        gridDraft[i][j] = 0;
      }
    }
  }
};

function App() {
  const [grid, setGrid] = useState(() => generateGrid());
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  runningRef.current = running;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;

    setGrid((g) => {
      return produce(g, (gridDraft) => {
        generateNextGeneration(g, gridDraft);
      });
    });

    setTimeout(runSimulation, 120);
  }, []);

  return (
    <>
      <div>
        <button
          onClick={() => {
            setRunning(!running);
            if (!running) {
              runningRef.current = true;
              runSimulation();
            }
          }}
        >
          {running ? "Stop" : "Start"}
        </button>
        <button
          onClick={() => {
            if (running) return;
            setGrid((g) => {
              return produce(g, (gridDraft) => {
                generateNextGeneration(g, gridDraft);
              });
            });
          }}
        >
          Next state
        </button>
        <button
          onClick={() => {
            setGrid(generateGrid(false));
          }}
        >
          Random
        </button>
        <button
          onClick={() => {
            setGrid(generateGrid());
          }}
        >
          Clear
        </button>
      </div>
      <div
        className="world"
        style={{
          gridTemplateColumns: `repeat(${numCols}, 20px)`,
        }}
      >
        {grid.map((rows, i) =>
          rows.map((cols, j) => (
            <div
              key={`${i}-${j}`}
              className="cell"
              onClick={() => {
                const newGrid = produce(grid, (draftGrid) => {
                  draftGrid[i][j] = !grid[i][j];
                });

                setGrid(newGrid);
              }}
            >
              <div
                className={`body ${
                  running
                    ? grid[i][j]
                      ? "alive"
                      : "dead"
                    : grid[i][j]
                    ? "life-animation"
                    : "death-animation"
                }`}
              ></div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default App;
