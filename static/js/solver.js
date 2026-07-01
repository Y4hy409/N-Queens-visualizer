const boardThemes = {
  classic: { lightClass: "theme-classic-light", darkClass: "theme-classic-dark", boardClass: "board-classic" },
  dark: { lightClass: "theme-light-light", darkClass: "theme-light-dark", boardClass: "board-light" },
  neon: { lightClass: "theme-green-light", darkClass: "theme-green-dark", boardClass: "board-green" },
  pastel: { lightClass: "theme-newspaper-light", darkClass: "theme-newspaper-dark", boardClass: "board-newspaper" },
};

const queenStyles = {
  classic: { icon: "♛" },
  crown: { icon: "👑" },
  robot: { icon: "🤖" },
  minimal: { icon: "⛀" },
};

function createEmptyBoard(n) {
  return Array.from({ length: n }, () => Array(n).fill("empty"));
}

function solutionToBoard(solution, n) {
  const cellStates = createEmptyBoard(n);
  for (let row = 0; row < n; row += 1) {
    cellStates[row][solution[row]] = "queen";
  }
  return { queens: [...solution], cellStates };
}

function computeDelay(speed) {
  const normalized = (speed - 1) / 99;
  return Math.round(140 + (1 - normalized) * (1 - normalized) * 2360);
}

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.querySelector("#solverApp");
  if (!app) return;

  const state = {
    n: Number(app.dataset.n),
    theme: app.dataset.theme,
    queenStyle: app.dataset.queenStyle,
    speed: Number(app.dataset.speed),
    steps: [],
    solutions: [],
    currentStep: -1,
    isPlaying: false,
    showExplanation: false,
    currentSolution: 0,
    viewMode: "stepping",
    waitingForNextSolution: false,
    skipAnimation: false,
    timerId: null,
  };

  const boardEl = document.querySelector("#chessboard");
  const boardShellEl = document.querySelector(".board-shell");
  const logEl = document.querySelector("#algorithmLog");
  const explainToggle = document.querySelector("#explainToggle");
  const solutionBanner = document.querySelector("#solutionBanner");
  const playButton = document.querySelector("#playButton");
  const stepForwardButton = document.querySelector("#stepForwardButton");
  const stepBackwardButton = document.querySelector("#stepBackwardButton");
  const resetButton = document.querySelector("#resetButton");
  const solutionButton = document.querySelector("#solutionButton");
  const solverSpeed = document.querySelector("#solverSpeed");

  const explanationCopy = {
    place: "The algorithm found a safe position and places a queen here.",
    check_conflict: "This position conflicts with an existing queen in the same column or diagonal.",
    backtrack: "No safe columns remain in this row, so the algorithm removes the last queen and tries the next option.",
    solution_found: "All N queens are placed with no conflicts. This is a valid solution.",
  };

  function currentBoard() {
    if (state.viewMode === "solution" && state.solutions.length > 0) {
      return solutionToBoard(state.solutions[state.currentSolution], state.n);
    }
    if (state.currentStep >= 0 && state.currentStep < state.steps.length) {
      return state.steps[state.currentStep].boardState;
    }
    return { queens: Array(state.n).fill(-1), cellStates: createEmptyBoard(state.n) };
  }

  function visibleSteps() {
    return state.steps.slice(0, state.currentStep + 1);
  }

  function currentStepData() {
    if (state.currentStep >= 0 && state.currentStep < state.steps.length) {
      return state.steps[state.currentStep];
    }
    return null;
  }

  function stopTimer() {
    if (state.timerId !== null) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    state.timerId = window.setInterval(stepForward, computeDelay(state.speed));
  }

  function updateStats() {
    const seenSteps = visibleSteps();
    document.querySelector("#statTotalSteps").textContent = String(state.currentStep + 1);
    document.querySelector("#statBacktracks").textContent = String(seenSteps.filter((step) => step.type === "backtrack").length);
    document.querySelector("#statSolutionsFound").textContent = String(
      state.viewMode === "solution" ? state.solutions.length : seenSteps.filter((step) => step.type === "solution_found").length
    );
    document.querySelector("#statTotalSolutions").textContent = String(state.solutions.length);
  }

  function renderLog() {
    const messages = state.viewMode === "solution"
      ? [`Showing Solution ${state.currentSolution + 1} / ${state.solutions.length}`]
      : visibleSteps().map((step) => step.message);

    logEl.innerHTML = "";

    if (messages.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Press Start to begin...";
      logEl.appendChild(empty);
    } else {
      messages.forEach((message, index) => {
        const line = document.createElement("div");
        line.className = `log-line${index === messages.length - 1 ? " is-latest" : ""}`;
        const count = document.createElement("span");
        count.className = "log-index";
        count.textContent = String(index + 1).padStart(3, "0");
        line.appendChild(count);
        line.append(message);
        logEl.appendChild(line);
      });
    }

    const step = currentStepData();
    if (state.showExplanation && step && explanationCopy[step.type]) {
      const box = document.createElement("div");
      box.className = "explanation-box";
      box.textContent = explanationCopy[step.type];
      logEl.appendChild(box);
    }

    logEl.scrollTop = logEl.scrollHeight;
  }

  function renderBoard() {
    const boardState = currentBoard();
    const theme = boardThemes[state.theme] ?? boardThemes.classic;
    const shellWidth = boardShellEl?.clientWidth ?? window.innerWidth;
    const shellHeight = boardShellEl?.clientHeight ?? window.innerHeight;
    const maxBoardSize = Math.max(
      state.n * 20,
      Math.min(shellWidth - 16, shellHeight - 16, 720)
    );
    const cellSize = Math.max(20, Math.floor(maxBoardSize / state.n));
    const boardSize = cellSize * state.n;

    boardEl.className = `chessboard ${theme.boardClass}`;
    boardEl.style.gridTemplateColumns = `repeat(${state.n}, ${cellSize}px)`;
    boardEl.style.gridTemplateRows = `repeat(${state.n}, ${cellSize}px)`;
    boardEl.style.width = `${boardSize}px`;
    boardEl.style.height = `${boardSize}px`;
    boardEl.innerHTML = "";

    for (let index = 0; index < state.n * state.n; index += 1) {
      const row = Math.floor(index / state.n);
      const col = index % state.n;
      const cellState = boardState.cellStates[row][col];
      const cell = document.createElement("div");
      cell.className = `board-cell ${(row + col) % 2 === 0 ? theme.lightClass : theme.darkClass}`;
      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;

      if (cellState === "attacked") {
        const overlay = document.createElement("div");
        overlay.className = "attack-overlay";
        cell.appendChild(overlay);
      } else if (cellState === "conflict") {
        cell.classList.add("conflict-cell");
        const conflict = document.createElement("span");
        conflict.className = "conflict-mark";
        conflict.textContent = "✕";
        cell.appendChild(conflict);
      }

      if (cellState === "queen") {
        if (state.queenStyle === "minimal") {
          const checker = document.createElement("div");
          checker.className = "checker-piece";
          checker.style.width = `${cellSize * 0.46}px`;
          checker.style.height = `${cellSize * 0.46}px`;
          const ring = document.createElement("div");
          ring.className = "checker-piece-inner";
          checker.appendChild(ring);
          cell.appendChild(checker);
        } else {
          const piece = document.createElement("span");
          piece.className = "queen-piece";
          piece.style.fontSize = `${cellSize * 0.55}px`;
          piece.textContent = queenStyles[state.queenStyle]?.icon ?? queenStyles.classic.icon;
          cell.appendChild(piece);
        }
      }

      boardEl.appendChild(cell);
    }
  }

  function renderBanner() {
    if (state.viewMode === "solution" && state.solutions.length > 0) {
      solutionBanner.hidden = false;
      solutionBanner.textContent = `Solution ${state.currentSolution + 1} / ${state.solutions.length}`;
      return;
    }
    solutionBanner.hidden = true;
  }

  function updateControls() {
    playButton.textContent = state.isPlaying ? "Pause" : state.waitingForNextSolution ? "Start Next Solution" : "Start";
    playButton.classList.toggle("attention-glow", !state.isPlaying && state.waitingForNextSolution);
    stepForwardButton.disabled = !(state.currentStep < state.steps.length - 1);
    stepBackwardButton.disabled = !(state.currentStep > -1);
    playButton.disabled = (!(state.currentStep < state.steps.length - 1) && !state.isPlaying) || (state.skipAnimation && state.steps.length === 0);
    solutionButton.disabled = state.solutions.length === 0;
  }

  function render() {
    renderBanner();
    renderBoard();
    renderLog();
    updateStats();
    updateControls();
  }

  function stepForward() {
    if (state.currentStep >= state.steps.length - 1) {
      state.isPlaying = false;
      stopTimer();
      render();
      return;
    }

    state.currentStep += 1;
    const step = state.steps[state.currentStep];
    if (step.type === "solution_found") {
      const solutionCount = state.steps
        .slice(0, state.currentStep + 1)
        .filter((entry) => entry.type === "solution_found").length;
      state.isPlaying = false;
      state.waitingForNextSolution = true;
      state.currentSolution = Math.max(solutionCount - 1, 0);
      stopTimer();
    }

    render();
  }

  function stepBackward() {
    state.currentStep = Math.max(-1, state.currentStep - 1);
    state.viewMode = "stepping";
    state.waitingForNextSolution = false;
    render();
  }

  function resetSolver() {
    state.isPlaying = false;
    state.currentStep = -1;
    state.currentSolution = 0;
    state.viewMode = state.skipAnimation ? "solution" : "stepping";
    state.waitingForNextSolution = false;
    stopTimer();
    render();
  }

  function showNextSolution() {
    if (state.solutions.length === 0) return;
    state.isPlaying = false;
    state.viewMode = "solution";
    state.waitingForNextSolution = false;
    state.currentSolution = (state.currentSolution + 1) % state.solutions.length;
    stopTimer();
    render();
  }

  function togglePlay() {
    if (state.isPlaying) {
      state.isPlaying = false;
      stopTimer();
      render();
      return;
    }

    if (state.currentStep >= state.steps.length - 1 || state.skipAnimation) return;
    state.viewMode = "stepping";
    state.waitingForNextSolution = false;
    state.isPlaying = true;
    startTimer();
    render();
  }

  async function loadSolverData() {
    logEl.innerHTML = '<p class="empty-state">Loading Python-generated steps...</p>';
    const response = await fetch(`/api/solver-data?n=${encodeURIComponent(state.n)}`);
    if (!response.ok) {
      throw new Error("Failed to load solver data");
    }
    const payload = await response.json();
    state.steps = payload.steps ?? [];
    state.solutions = payload.solutions ?? [];
    state.skipAnimation = Boolean(payload.skipAnimation);
    state.viewMode = state.skipAnimation ? "solution" : "stepping";
  }

  playButton.addEventListener("click", togglePlay);
  stepForwardButton.addEventListener("click", () => {
    state.viewMode = "stepping";
    state.waitingForNextSolution = false;
    stepForward();
  });
  stepBackwardButton.addEventListener("click", stepBackward);
  resetButton.addEventListener("click", resetSolver);
  solutionButton.addEventListener("click", showNextSolution);
  solverSpeed.addEventListener("input", (event) => {
    state.speed = Number(event.target.value);
    if (state.isPlaying) startTimer();
  });
  explainToggle.addEventListener("change", (event) => {
    state.showExplanation = event.target.checked;
    renderLog();
  });
  window.addEventListener("resize", renderBoard);

  try {
    await loadSolverData();
  } catch (_error) {
    logEl.innerHTML = '<p class="empty-state">Unable to load Python solver data.</p>';
  }

  render();
});
