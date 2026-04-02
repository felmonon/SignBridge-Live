# Development Guide

## Overview

SignBridge Live is now a single repository with:

- `app/` for the FastAPI backend
- `frontend/` for the React + Vite frontend

The backend serves the built frontend from `frontend/dist` by default.

## Local Setup

### Backend

```sh
cd /Users/felmonfekadu/Developer/SignLanguage
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Start the backend:

```sh
python run.py
```

### Frontend

```sh
cd /Users/felmonfekadu/Developer/SignLanguage/frontend
npm install
```

Run the frontend in Vite dev mode:

```sh
npm run dev
```

Build the production frontend that FastAPI serves:

```sh
npm run build
```

## Recommended Edit Cycle

1. modify backend code in `app/` as needed
2. modify frontend code in `frontend/src/`
3. run `npm run build` inside `frontend/`
4. run or refresh the FastAPI app
5. verify behavior at `http://127.0.0.1:8000`

## Validation Checklist

Before pushing changes:

- backend imports compile cleanly
- frontend production build succeeds
- `GET /api/health` returns `200`
- `GET /` returns the built frontend
- at least one manual translation request succeeds
- at least one manual TTS playback succeeds

## Notes

- `FRONTEND_DIST_DIR` is optional and only needed if you want the backend to serve a different build path.
- The frontend uses relative `/api/...` calls, so it works cleanly when served by the backend.
