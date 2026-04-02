# SignBridge Live

SignBridge Live is an end-to-end sign-language translation prototype built around a simple idea:

- capture live webcam video in the browser
- send short clips to Gemini for multimodal translation
- de-duplicate repeated utterances on the backend
- speak translated English with OpenAI text-to-speech

This repository contains the FastAPI backend and the runtime integration for a companion premium React frontend. By design, the frontend source remains in the separate desktop workspace you already created and the backend serves its built `dist/` output.

## What This Project Does

SignBridge Live aims to support live, webcam-based sign-language interpretation for conversational use. The browser records rolling video clips, the backend sends them to Gemini with short conversation context, and translated English is optionally spoken aloud with OpenAI TTS.

This is a practical API-first prototype for continuous sign-language translation from general webcam video. It is not a research-grade dedicated ASL model and it does not claim production interpreter accuracy.

## Current Architecture

- **Frontend runtime**: React + Vite companion app in `/Users/felmonfekadu/Desktop/SignBridge Live Web App Design`
- **Backend**: FastAPI app in this repository
- **Translation provider**: Google Gemini multimodal video understanding
- **Voice provider**: OpenAI `gpt-4o-mini-tts`
- **Session logic**: short rolling context and duplicate suppression

High-level flow:

1. Browser starts camera.
2. Browser records a clip with `MediaRecorder`.
3. Browser posts the clip to `POST /api/translate`.
4. Backend translates with Gemini.
5. Backend stores recent transcript context and suppresses obvious duplicates.
6. Browser optionally calls `POST /api/speak`.
7. OpenAI returns WAV audio for playback.

See [docs/architecture.md](docs/architecture.md) for the deeper breakdown.

## Repository Layout

```text
SignLanguage/
├── app/
│   ├── config.py
│   ├── providers/
│   │   ├── gemini_translator.py
│   │   └── openai_tts.py
│   ├── schemas.py
│   ├── server.py
│   └── services/
│       └── session_store.py
├── docs/
│   ├── api.md
│   ├── architecture.md
│   ├── development.md
│   └── troubleshooting.md
├── .env.example
├── requirements.txt
└── run.py
```

## Prerequisites

- macOS or Linux
- Python 3.11+
- Node.js 20+
- a Google AI Studio key for Gemini
- an OpenAI API key for TTS

## Quick Start

### 1. Set backend environment variables

Create `.env` from the example and set real credentials:

```sh
cd /Users/felmonfekadu/Developer/SignLanguage
cp .env.example .env
```

Required values:

- `GEMINI_API_KEY`
- `OPENAI_API_KEY`

### 2. Build the companion frontend

```sh
cd "/Users/felmonfekadu/Desktop/SignBridge Live Web App Design"
npm install
npm run build
```

### 3. Start the backend

```sh
cd /Users/felmonfekadu/Developer/SignLanguage
./SignLanguage/bin/python run.py
```

### 4. Open the app

```text
http://127.0.0.1:8000
```

The backend serves the built frontend from:

```text
/Users/felmonfekadu/Desktop/SignBridge Live Web App Design/dist
```

If you move that frontend build somewhere else, set `FRONTEND_DIST_DIR`.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Enables Gemini translation |
| `OPENAI_API_KEY` | Yes | Enables OpenAI TTS |
| `APP_NAME` | No | App title in backend responses |
| `HOST` | No | Server bind host, default `127.0.0.1` |
| `PORT` | No | Server port, default `8000` |
| `FRONTEND_DIST_DIR` | No | Absolute path to built frontend assets |
| `GEMINI_MODEL` | No | Default `gemini-2.5-flash` |
| `OPENAI_TTS_MODEL` | No | Default `gpt-4o-mini-tts` |
| `OPENAI_TTS_VOICE` | No | Default `coral` |
| `CLIP_SECONDS` | No | Clip duration used by the frontend session bootstrap |
| `SIGN_LANGUAGE_HINT` | No | Default sign-language hint, default `ASL` |

## API Summary

- `GET /api/health`
  Returns app health and provider availability.
- `POST /api/session`
  Creates a session and returns clip defaults plus provider status.
- `POST /api/translate`
  Accepts a base64-encoded browser-recorded video clip and returns translated text, confidence, and transcript state.
- `POST /api/speak`
  Accepts text and returns WAV audio.

See [docs/api.md](docs/api.md) for request and response examples.

## Development Notes

- The backend no longer uses the old Jinja/template frontend.
- The frontend source is intentionally not vendored into this repository.
- The app is clip-based, not frame-by-frame.
- Translation quality depends heavily on lighting, framing, signing style, and clip boundaries.

See [docs/development.md](docs/development.md) and [docs/troubleshooting.md](docs/troubleshooting.md).

## Security

- Never commit `.env`.
- Rotate any API keys that have been pasted into chat, terminals, screenshots, or shared logs.
- This app sends recorded sign-language video clips to a third-party provider for translation.

## Limitations

- This is not a dedicated ASL sequence model.
- It relies on a general multimodal model rather than a signer-specific or dataset-trained recognizer.
- Conversation quality can drop with weak lighting, occluded hands, or poorly segmented signing turns.
- The current repository structure depends on a separate frontend workspace by request.

## Future Improvements

- bring the frontend source into a proper monorepo when you want a portable public repository
- add transcript persistence and session export
- add streaming or lower-latency clip overlap strategies
- add provider-side confidence gating and better user-facing fallback states
- replace Gemini with a specialized sign-language sequence model if you want serious production accuracy
