from collections import deque
from dataclasses import dataclass, field
from time import monotonic
from uuid import uuid4

from app.config import settings
from app.schemas import GeminiTranslationResult, TranscriptItem


def _normalize(text: str) -> str:
    return " ".join(text.lower().split())


@dataclass
class SessionState:
    session_id: str
    created_at: float = field(default_factory=monotonic)
    updated_at: float = field(default_factory=monotonic)
    transcript: list[TranscriptItem] = field(default_factory=list)
    history: deque[str] = field(default_factory=lambda: deque(maxlen=6))
    last_spoken_text: str = ""
    last_status: str = "Waiting for video."

    def context_lines(self) -> list[str]:
        return list(self.history)

    def register(self, translation: GeminiTranslationResult) -> tuple[str, bool, str]:
        self.updated_at = monotonic()

        if not translation.signing_detected:
            status = translation.notes or "No clear sign-language utterance detected."
            self.last_status = status
            return "", False, status

        cleaned = translation.translation.strip()
        if not cleaned:
            status = translation.notes or "Need more context."
            self.last_status = status
            return "", False, status

        normalized = _normalize(cleaned)
        duplicate = normalized == _normalize(self.last_spoken_text)
        should_speak = bool(translation.should_emit and not duplicate)

        if should_speak:
            self.last_spoken_text = cleaned
            self.history.append(cleaned)
            timestamp_ms = int(monotonic() * 1000)
            self.transcript.append(
                TranscriptItem(
                    text=cleaned,
                    timestamp_ms=timestamp_ms,
                    source="gemini",
                )
            )
            self.transcript = self.transcript[-settings.transcript_limit :]
            status = "Translated signed utterance."
        else:
            status = translation.notes or "Duplicate or low-signal segment skipped."

        self.last_status = status
        return cleaned, should_speak, status


class SessionStore:
    def __init__(self):
        self._sessions: dict[str, SessionState] = {}

    def create(self) -> SessionState:
        session = SessionState(session_id=str(uuid4()))
        self._sessions[session.session_id] = session
        return session

    def get(self, session_id: str) -> SessionState:
        if session_id not in self._sessions:
            self._sessions[session_id] = SessionState(session_id=session_id)
        return self._sessions[session_id]
