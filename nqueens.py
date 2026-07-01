from __future__ import annotations

from typing import Literal, TypedDict


CellState = Literal["empty", "queen", "attacked", "safe", "conflict", "checking"]
StepType = Literal["place", "check_safe", "check_conflict", "backtrack", "solution_found"]


class Highlight(TypedDict):
    row: int
    col: int
    state: CellState


class BoardState(TypedDict):
    queens: list[int]
    cellStates: list[list[CellState]]


class AlgorithmStep(TypedDict):
    type: StepType
    row: int
    col: int
    message: str
    boardState: BoardState


class SolverResult(TypedDict):
    steps: list[AlgorithmStep]
    solutions: list[list[int]]
    skipAnimation: bool


def create_empty_board(n: int) -> list[list[CellState]]:
    # Start every render frame as an empty NxN board.
    return [["empty" for _ in range(n)] for _ in range(n)]


def clone_queens(queens: list[int]) -> list[int]:
    return list(queens)


def get_attacked_cells(queens: list[int], n: int) -> set[tuple[int, int]]:
    attacked: set[tuple[int, int]] = set()
    for row in range(n):
        col = queens[row]
        if col == -1:
            continue
        # A queen attacks along its full row, full column, and both diagonals.
        for i in range(n):
            attacked.add((row, i))
            attacked.add((i, col))
            if row + i < n and col + i < n:
                attacked.add((row + i, col + i))
            if row - i >= 0 and col - i >= 0:
                attacked.add((row - i, col - i))
            if row + i < n and col - i >= 0:
                attacked.add((row + i, col - i))
            if row - i >= 0 and col + i < n:
                attacked.add((row - i, col + i))
    return attacked


def build_board_state(
    queens: list[int],
    n: int,
    highlights: list[Highlight] | None = None,
) -> BoardState:
    cell_states = create_empty_board(n)
    attacked = get_attacked_cells(queens, n)

    # Paint every currently attacked square first.
    for row, col in attacked:
        cell_states[row][col] = "attacked"

    # Then place the queens on top so they stay visible.
    for row in range(n):
        if queens[row] != -1:
            cell_states[row][queens[row]] = "queen"

    if highlights:
        # Extra highlights are used for the current animation step, such as
        # conflicts or the attack path of a newly placed queen.
        for highlight in highlights:
            row = highlight["row"]
            col = highlight["col"]
            if cell_states[row][col] != "queen":
                cell_states[row][col] = highlight["state"]

    return {"queens": clone_queens(queens), "cellStates": cell_states}


def is_safe(queens: list[int], row: int, col: int) -> bool:
    # Only earlier rows can contain queens because we place one row at a time.
    for i in range(row):
        if queens[i] == -1:
            continue
        # Reject same-column collisions.
        if queens[i] == col:
            return False
        # Reject diagonal collisions.
        if abs(queens[i] - col) == abs(i - row):
            return False
    return True


def solution_to_board(solution: list[int], n: int) -> BoardState:
    cell_states = create_empty_board(n)
    for row in range(n):
        cell_states[row][solution[row]] = "queen"
    return {"queens": list(solution), "cellStates": cell_states}


def generate_all_steps(n: int) -> SolverResult:
    steps: list[AlgorithmStep] = []
    solutions: list[list[int]] = []
    queens = [-1] * n
    # Full animation traces grow very quickly, so switch larger boards to a
    # static solution view before page loads become sluggish.
    skip_animation = n > 8

    def solve_with_steps(row: int) -> None:
        # Base case: every row has a queen, so we found one valid solution.
        if row == n:
            steps.append(
                {
                    "type": "solution_found",
                    "row": -1,
                    "col": -1,
                    "message": f"Solution {len(solutions) + 1} found!",
                    "boardState": build_board_state(queens, n),
                }
            )
            solutions.append(clone_queens(queens))
            return

        for col in range(n):
            # Try each column in the current row.
            safe = is_safe(queens, row, col)
            if safe:
                # Tentatively place the queen before exploring deeper.
                queens[row] = col
                attack_highlights: list[Highlight] = []
                for i in range(n):
                    if i != row:
                        attack_highlights.append({"row": row, "col": i, "state": "attacked"})
                        attack_highlights.append({"row": i, "col": col, "state": "attacked"})
                    diagonals = (
                        (row + i, col + i),
                        (row + i, col - i),
                        (row - i, col + i),
                        (row - i, col - i),
                    )
                    for target_row, target_col in diagonals:
                        if (
                            0 <= target_row < n
                            and 0 <= target_col < n
                            and not (target_row == row and target_col == col)
                        ):
                            attack_highlights.append(
                                {"row": target_row, "col": target_col, "state": "attacked"}
                            )

                # Record the placement as a visual step for the frontend player.
                steps.append(
                    {
                        "type": "place",
                        "row": row,
                        "col": col,
                        "message": f"Placing Queen at Row {row + 1}, Column {col + 1}",
                        "boardState": build_board_state(queens, n, attack_highlights),
                    }
                )

                # Recurse into the next row.
                solve_with_steps(row + 1)

                # Undo the move so the next column can be tested.
                queens[row] = -1
                if row < n - 1 or col < n - 1:
                    steps.append(
                        {
                            "type": "backtrack",
                            "row": row,
                            "col": col,
                            "message": f"Backtracking from Row {row + 1}, Column {col + 1}",
                            "boardState": build_board_state(queens, n),
                        }
                    )
            else:
                # Record failed placements too so the visualizer can show why
                # a square was rejected.
                steps.append(
                    {
                        "type": "check_conflict",
                        "row": row,
                        "col": col,
                        "message": f"Conflict at Row {row + 1}, Column {col + 1}",
                        "boardState": build_board_state(
                            queens,
                            n,
                            [{"row": row, "col": col, "state": "conflict"}],
                        ),
                    }
                )

    def solve_solutions_only(row: int, limit: int) -> bool:
        # For large N, compute only enough solutions to show a static result
        # instead of generating a huge animation trace.
        if row == n:
            solutions.append(clone_queens(queens))
            return len(solutions) >= limit

        for col in range(n):
            if is_safe(queens, row, col):
                queens[row] = col
                if solve_solutions_only(row + 1, limit):
                    queens[row] = -1
                    return True
                queens[row] = -1
        return False

    if skip_animation:
        solve_solutions_only(0, limit=1)
    else:
        # For visualizable board sizes, generate the complete step-by-step trace.
        solve_with_steps(0)

    return {"steps": steps, "solutions": solutions, "skipAnimation": skip_animation}
