# Architecture

## Goal

SignBridge Live is designed as a browser-to-API pipeline for live sign-language interpretation:

- browser captures webcam clips
- backend translates clips with Gemini
- backend manages session context and duplicate suppression
- browser requests OpenAI TTS for audible English output

The system is intentionally simple and API-first. It prioritizes a working end-to-end prototype over a custom trained sign-language model.

## System Overview

### Frontend

The frontend now lives in the repository under:

```text
frontend/
```

Responsibilities:

- request camera access
- record short video clips with `MediaRecorder`
- call the backend session and translation APIs
- play TTS audio returned by the backend
- render live status, translation hero text, and transcript history

The backend serves the built `dist/` bundle from this in-repo frontend app.

### Backend

The backend lives in this repository and is responsible for:

- configuration loading
- provider client setup
- API endpoints
- clip decoding and validation
- session state and transcript management
- duplicate suppression
- TTS proxying
- serving the built frontend bundle

Core files:

- [`app/server.py`](../app/server.py)
- [`app/config.py`](../app/config.py)
- [`app/schemas.py`](../app/schemas.py)
- [`app/services/session_store.py`](../app/services/session_store.py)
- [`app/providers/gemini_translator.py`](../app/providers/gemini_translator.py)
- [`app/providers/openai_tts.py`](../app/providers/openai_tts.py)

## Request Flow

### 1. Session Bootstrap

The frontend calls `POST /api/session`.

The backend returns:

- `session_id`
- `clip_seconds`
- provider availability
- default sign-language hint

This keeps the browser lightweight and lets the backend control runtime defaults.

### 2. Clip Translation

The frontend records a short clip and base64-encodes it before calling `POST /api/translate`.

Backend processing:

1. decode base64 payload
2. validate clip size
3. load or create session state
4. pass clip bytes to Gemini
5. normalize and de-duplicate the resulting translation
6. append to transcript if the utterance is new enough to emit
7. return translation, confidence, transcript, and status

### 3. Voice Output

If the frontend decides to speak the translated text, it calls `POST /api/speak`.

Backend processing:

1. validate OpenAI configuration
2. synthesize WAV audio with `gpt-4o-mini-tts`
3. return audio bytes to the browser

### 4. Frontend Asset Serving

The backend serves the built Vite bundle via:

- `GET /`
- `GET /{full_path}`

The asset directory defaults to `frontend/dist` and can be overridden with `FRONTEND_DIST_DIR`.

## Session Model

Each session stores:

- a generated session ID
- recent normalized history for context
- emitted transcript items
- last spoken translation
- last status message

This allows the backend to:

- pass minimal recent context into Gemini
- suppress obvious duplicate utterances
- return a short transcript timeline to the frontend

## Translation Strategy

The backend uses a conservative prompt:

- translate the signer’s intended utterance
- do not hallucinate
- return structured JSON
- avoid emitting when no clear signed utterance is visible

This keeps the frontend logic simple:

- if `should_speak` is false, the UI can still display status
- if `translation` is empty, the UI can remain in “waiting” or “need more context”

## Why This Is Not a Dedicated Sign-Language Model

This system depends on generic multimodal video understanding instead of:

- a specialized ASL gloss recognizer
- hand landmark sequence modeling
- signer-adapted fine-tuning
- gloss-to-English translation training

That means it works as a prototype, but not as a claim of interpreter-grade reliability.

## Current Tradeoffs

### Strengths

- fast to iterate
- simple browser architecture
- low local ML complexity
- clear provider boundaries

### Weaknesses

- dependent on clip segmentation quality
- dependent on general-purpose provider behavior
- not guaranteed to preserve ASL grammar faithfully
- still limited by generic multimodal provider behavior rather than a dedicated sign-language model
