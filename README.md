# N-Queens AI Visualizer

An interactive learning tool that visualizes how a backtracking algorithm solves
the classic N-Queens problem. Configure the board, start the solver, and follow
each placement, conflict, and backtrack in real time.

## Features

- Step-by-step backtracking visualization
- Configurable board sizes from 4×4 to 20×20
- Play, pause, reset, and manual step controls
- Multiple board themes and queen styles
- Adjustable animation speed
- Live algorithm log and solution metrics
- Explanation mode for each algorithm decision

## Tech stack

- Python 3
- Flask
- HTML5
- CSS3
- JavaScript

## Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Y4hy409/N-Queens-visualizer.git
   cd N-Queens-visualizer
   ```

2. Create and activate a virtual environment:

   **Windows (PowerShell)**

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   **macOS/Linux**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies and start the app:

   ```bash
   pip install -r requirements.txt
   python app.py
   ```

4. Open [http://127.0.0.1:5000](http://127.0.0.1:5000).

## Project structure

```text
.
├── app.py                 # Flask application and routes
├── nqueens.py             # N-Queens solver logic
├── requirements.txt       # Python dependencies
├── vercel.json            # Vercel deployment configuration
├── static/
│   ├── css/styles.css
│   └── js/
└── templates/             # Jinja HTML templates
```

## Deployment

The project includes a `vercel.json` configuration and can be imported directly
into Vercel from this GitHub repository.

## Author

Created by [Y4hy409](https://github.com/Y4hy409).
