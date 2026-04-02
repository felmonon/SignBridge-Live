# Development Guide

## Local Workflow

This project currently uses a split workspace:

- backend source in this repository
- frontend source in the companion desktop directory

Backend repository:

```text
/Users/felmonfekadu/Developer/SignLanguage
```

Frontend source:

```text
/Users/felmonfekadu/Desktop/SignBridge Live Web App Design
```

## Backend Setup

Create or activate the Python virtual environment:

```sh
cd /Users/felmonfekadu/Developer/SignLanguage
source SignLanguage/bin/activate
pip install -r requirements.txt
```

Run the backend:

```sh
./SignLanguage/bin/python run.py
```

## Frontend Setup

Install dependencies:

```sh
cd "/Users/felmonfekadu/Desktop/SignBridge Live Web App Design"
npm install
```

Run the frontend in Vite dev mode if you want to work on the UI directly:

```sh
npm run dev
```

Build the frontend for backend serving:

```sh
npm run build
```

The backend reads the built output from `FRONTEND_DIST_DIR`.

## Backend-Frontend Integration Contract

The frontend expects:

- `POST /api/session`
- `POST /api/translate`
- `POST /api/speak`
- `GET /api/health`

The backend expects:

- a built frontend `dist/` directory
- valid Gemini and OpenAI API keys

## Recommended Edit Cycle

1. edit frontend in the desktop companion project
2. run `npm run build`
3. restart or refresh the backend-served app
4. verify browser behavior against `http://127.0.0.1:8000`

## Validation Checklist

Before publishing changes:

- backend imports compile cleanly
- frontend production build succeeds
- `GET /api/health` returns `200`
- `GET /` returns the built frontend
- one manual translation cycle works end to end
- one manual TTS playback cycle works end to end

## Recommended Future Refactor

If you want a portable public repository, move to a monorepo like:

```text
signbridge-live/
├── backend/
└── frontend/
```

That would remove the current desktop-path dependency and make CI/CD far cleaner.
