import asyncio
import base64
import binascii
from pathlib import Path
from time import perf_counter

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse, Response

from app.config import settings
from app.providers.gemini_translator import GeminiVideoTranslator
from app.providers.openai_tts import OpenAITTSService
from app.schemas import SpeakRequest, TranslateClipRequest, TranslateClipResponse
from app.services.session_store import SessionStore


FRONTEND_DIST = Path(settings.frontend_dist_dir).expanduser()

app = FastAPI(title=settings.app_name)

translator = GeminiVideoTranslator()
tts_service = OpenAITTSService()
sessions = SessionStore()


def _decode_clip(data: str) -> bytes:
    payload = data.split(",", 1)[-1]
    try:
        return base64.b64decode(payload, validate=True)
    except binascii.Error as exc:
        raise HTTPException(status_code=400, detail="Invalid base64 video payload.") from exc


def _frontend_response(path: str) -> Response:
    if not FRONTEND_DIST.exists():
        return PlainTextResponse(
            "Frontend build not found. Run `npm install` and `npm run build` in "
            "`~/Desktop/SignBridge Live Web App Design`.",
            status_code=503,
        )

    requested = (FRONTEND_DIST / path).resolve()
    if requested.is_file() and FRONTEND_DIST in requested.parents:
        return FileResponse(requested)

    if path and "." in Path(path).name:
        return PlainTextResponse("Not found.", status_code=404)

    return FileResponse(FRONTEND_DIST / "index.html")


@app.get("/api/health")
async def health():
    return {
        "ok": True,
        "app": settings.app_name,
        "providers": {
            "gemini": translator.enabled,
            "openai_tts": tts_service.enabled,
        },
    }


@app.post("/api/session")
async def create_session():
    session = sessions.create()
    return {
        "session_id": session.session_id,
        "app_name": settings.app_name,
        "clip_seconds": settings.clip_seconds,
        "providers": {
            "gemini": translator.enabled,
            "openai_tts": tts_service.enabled,
        },
        "sign_language_hint": settings.default_sign_language,
    }


@app.post("/api/translate", response_model=TranslateClipResponse)
async def translate_clip(payload: TranslateClipRequest):
    if not translator.enabled:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY is not configured.")

    video_bytes = _decode_clip(payload.video_base64)
    if len(video_bytes) > settings.max_clip_bytes:
        raise HTTPException(status_code=413, detail="Video clip is too large.")

    started = perf_counter()
    session = sessions.get(payload.session_id)

    result = await asyncio.to_thread(
        translator.translate_clip,
        video_bytes=video_bytes,
        mime_type=payload.mime_type,
        sign_language_hint=payload.sign_language_hint or settings.default_sign_language,
        conversation_context=session.context_lines(),
    )
    translation, should_speak, status = session.register(result)
    elapsed_ms = int((perf_counter() - started) * 1000)

    return TranslateClipResponse(
        session_id=session.session_id,
        translation=translation,
        confidence=result.confidence,
        should_speak=should_speak,
        signing_detected=result.signing_detected,
        status=status,
        elapsed_ms=elapsed_ms,
        transcript=session.transcript,
    )


@app.post("/api/speak")
async def speak(payload: SpeakRequest):
    if not tts_service.enabled:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY is not configured.")

    audio_bytes = await asyncio.to_thread(tts_service.synthesize, payload.text)
    return Response(content=audio_bytes, media_type="audio/wav")


@app.get("/", response_class=Response)
async def serve_index():
    return _frontend_response("index.html")


@app.get("/{full_path:path}", response_class=Response)
async def serve_frontend(full_path: str):
    return _frontend_response(full_path)
