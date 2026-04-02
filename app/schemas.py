from typing import Literal

from pydantic import BaseModel, Field


class TranscriptItem(BaseModel):
    text: str
    timestamp_ms: int
    source: Literal["gemini"]


class TranslateClipRequest(BaseModel):
    session_id: str
    mime_type: str = Field(min_length=1, max_length=120)
    video_base64: str = Field(min_length=1)
    sign_language_hint: str | None = Field(default=None, max_length=40)


class SpeakRequest(BaseModel):
    text: str = Field(min_length=1, max_length=600)


class GeminiTranslationResult(BaseModel):
    signing_detected: bool
    translation: str = ""
    confidence: Literal["low", "medium", "high"] = "low"
    should_emit: bool = False
    notes: str = ""


class TranslateClipResponse(BaseModel):
    session_id: str
    translation: str
    confidence: Literal["low", "medium", "high"]
    should_speak: bool
    signing_detected: bool
    status: str
    elapsed_ms: int
    provider: str = "gemini"
    transcript: list[TranscriptItem]


TRANSLATION_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "signing_detected": {"type": "boolean"},
        "translation": {"type": "string"},
        "confidence": {
            "type": "string",
            "enum": ["low", "medium", "high"],
        },
        "should_emit": {"type": "boolean"},
        "notes": {"type": "string"},
    },
    "required": [
        "signing_detected",
        "translation",
        "confidence",
        "should_emit",
        "notes",
    ],
}
