from __future__ import annotations

from dataclasses import dataclass
from typing import Final

from flask import Flask, render_template, request


@dataclass(frozen=True)
class ThemeOption:
    id: str
    name: str


@dataclass(frozen=True)
class QueenOption:
    id: str
    name: str
    icon: str


BOARD_THEMES: Final[list[ThemeOption]] = [
    ThemeOption("classic", "Classic Wood"),
    ThemeOption("dark", "Dark"),
    ThemeOption("neon", "Green"),
    ThemeOption("pastel", "Newspaper"),
]

QUEEN_STYLES: Final[list[QueenOption]] = [
    QueenOption("classic", "Classic Queen", "♛"),
    QueenOption("crown", "Crown", "👑"),
    QueenOption("robot", "Robot Queen", "🤖"),
    QueenOption("minimal", "Checkers", "⛀"),
]

THEME_IDS: Final[set[str]] = {theme.id for theme in BOARD_THEMES}
QUEEN_IDS: Final[set[str]] = {style.id for style in QUEEN_STYLES}


def clamp_int(value: str | None, default: int, lower: int, upper: int) -> int:
    try:
        parsed = int(value) if value is not None else default
    except ValueError:
        parsed = default
    return max(lower, min(upper, parsed))


def create_app() -> Flask:
    app = Flask(__name__)

    @app.route("/")
    def index() -> str:
        return render_template(
            "index.html",
            board_themes=BOARD_THEMES,
            queen_styles=QUEEN_STYLES,
            default_n=8,
            default_theme="classic",
            default_queen_style="classic",
            default_speed=50,
        )

    @app.route("/solver")
    def solver() -> str:
        n = clamp_int(request.args.get("n"), default=8, lower=4, upper=20)
        theme = request.args.get("theme", "classic")
        queen_style = request.args.get("queenStyle", "classic")
        speed = clamp_int(request.args.get("speed"), default=50, lower=1, upper=100)

        if theme not in THEME_IDS:
            theme = "classic"
        if queen_style not in QUEEN_IDS:
            queen_style = "classic"

        return render_template(
            "solver.html",
            n=n,
            theme=theme,
            queen_style=queen_style,
            speed=speed,
        )

    @app.errorhandler(404)
    def not_found(_error: Exception) -> tuple[str, int]:
        return render_template("404.html"), 404

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
