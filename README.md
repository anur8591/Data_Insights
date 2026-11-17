# Data_Insights

A simple JavaScript welcome page served by a FastAPI backend.

## Run locally

1. Open a terminal in this folder.
2. Install dependencies: `python -m pip install -r requirements.txt`
3. Start the app: `python -m uvicorn main:app --reload`
4. Open http://127.0.0.1:8000

The welcome message is also available as JSON at `/api/message`.
