# API Reference

Base URL:

```text
http://127.0.0.1:8000
```

## GET `/api/health`

Returns backend health and provider availability.

### Example Response

```json
{
  "ok": true,
  "app": "SignBridge Live",
  "session_store": {
    "backend": "upstash-redis",
    "ttl_seconds": 1800
  },
  "providers": {
    "gemini": true,
    "openai_tts": true
  }
}
```

## POST `/api/session`

Creates a live translation session.

### Example Response

```json
{
  "session_id": "20d5c1bb-c5c9-4d64-95c8-1bfbd327c17b",
  "app_name": "SignBridge Live",
  "clip_seconds": 3.0,
  "providers": {
    "gemini": true,
    "openai_tts": true
  },
  "sign_language_hint": "ASL",
  "session_store": "upstash-redis"
}
```

## POST `/api/translate`

Accepts a base64-encoded recorded video clip and returns translated output.

### Request Body

```json
{
  "session_id": "20d5c1bb-c5c9-4d64-95c8-1bfbd327c17b",
  "mime_type": "video/webm",
  "video_base64": "data:video/webm;base64,AAAA...",
  "sign_language_hint": "ASL"
}
```

### Response Body

```json
{
  "session_id": "20d5c1bb-c5c9-4d64-95c8-1bfbd327c17b",
  "translation": "I need help with this form.",
  "confidence": "medium",
  "should_speak": true,
  "signing_detected": true,
  "status": "Translated signed utterance.",
  "elapsed_ms": 1420,
  "provider": "gemini",
  "transcript": [
    {
      "text": "I need help with this form.",
      "timestamp_ms": 138381121,
      "source": "gemini"
    }
  ]
}
```

### Confidence Values

- `low`
- `medium`
- `high`

### Common Error Responses

- `400`: invalid base64 payload
- `413`: clip too large
- `503`: Gemini API key not configured

## POST `/api/speak`

Accepts English text and returns `audio/wav`.

### Request Body

```json
{
  "text": "I need help with this form."
}
```

### Response

- content type: `audio/wav`
- body: binary WAV data

### Common Error Responses

- `503`: OpenAI API key not configured

## Frontend Asset Routes

The backend also serves the built frontend:

- `GET /`
- `GET /assets/...`
- `GET /{app-route}`

Unknown asset-like paths return `404`. Application routes fall back to `index.html`.
