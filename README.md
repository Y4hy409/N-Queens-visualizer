# N-Queens Visualizer

<div align="center">

An interactive, step-by-step visualization of the classic N-Queens problem,
powered by Python, Flask, and a backtracking algorithm.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://n-queens-ai-visualizer-main-chi.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/Y4hy409/N-Queens-visualizer)

[View live demo](https://n-queens-ai-visualizer-main-chi.vercel.app) ·
[Report a bug](https://github.com/Y4hy409/N-Queens-visualizer/issues/new) ·
[Request a feature](https://github.com/Y4hy409/N-Queens-visualizer/issues/new)

</div>

## About

The N-Queens problem asks how `N` queens can be placed on an `N x N` chessboard
without any two queens attacking each other. This project turns the recursive
backtracking solution into an interactive experience: every placement, conflict,
and backtrack is visible as it happens.

## Features

- Step-by-step backtracking visualization
- Board sizes from 4 x 4 to 20 x 20
- Play, pause, reset, and manual step controls
- Adjustable animation speed
- Multiple board themes and queen styles
- Live algorithm log and solution metrics
- Clear explanations for algorithm decisions
- Responsive interface for desktop and mobile

## How it works

The solver places one queen in each row. For every candidate square, it checks
whether another queen occupies the same column or diagonal:

1. Place a queen on a safe square.
2. Move recursively to the next row.
3. If no safe square remains, remove the previous queen.
4. Try the next available column.
5. Continue until a complete arrangement is found.

For boards larger than 8 x 8, the app computes a solution without generating the
full animation trace to keep page loads responsive.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Python, Flask |
| Frontend | HTML, CSS, JavaScript |
| Algorithm | Recursive backtracking |
| Deployment | Vercel |

## Run locally

### Prerequisites

- Python 3.10 or newer
- Git

### Installation

```bash
git clone https://github.com/Y4hy409/N-Queens-visualizer.git
cd N-Queens-visualizer
python -m venv .venv
```

Activate the virtual environment:

```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
```

```bash
# macOS or Linux
source .venv/bin/activate
```

Install the dependency and start the development server:

```bash
pip install -r requirements.txt
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.

## Project structure

```text
N-Queens-visualizer/
|-- app.py                 # Flask application and routes
|-- nqueens.py             # Backtracking solver and visualization states
|-- requirements.txt       # Python dependencies
|-- vercel.json            # Vercel deployment configuration
|-- static/
|   |-- css/styles.css     # Application styling
|   `-- js/
|       |-- home.js        # Home-page interactions
|       `-- solver.js      # Visualization player
`-- templates/
    |-- base.html          # Shared page layout
    |-- index.html         # Configuration screen
    |-- solver.html        # Interactive visualizer
    `-- 404.html           # Custom not-found page
```

## Deployment

The repository includes a Vercel configuration for the Flask application.
Import the repository into Vercel or use the deployment badge above. Every push
to `main` is automatically deployed through the connected Vercel project.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the
development workflow and pull-request guidelines.

## Author

Created and maintained by [Y4hy409](https://github.com/Y4hy409).
