import json
from dataclasses import dataclass, field
from time import time
from typing import Any
from uuid import uuid4

from app.config import settings
from app.schemas import GeminiTranslationResult, TranscriptItem

try:
    from upstash_redis import Redis
except ImportError:  # pragma: no cover - dependency is expected in production.
    Redis = None


def _normalize(text: str) -> str:
    return " ".join(text.lower().split())


def _now_ms() -> int:
    return int(time() * 1000)


@dataclass
class SessionState:
    session_id: str
    created_at_ms: int = field(default_factory=_now_ms)
    updated_at_ms: int = field(default_factory=_now_ms)
    transcript: list[TranscriptItem] = field(default_factory=list)
    history: list[str] = field(default_factory=list)
    last_spoken_text: str = ""
    last_status: str = "Waiting for video."

    def context_lines(self) -> list[str]:
        return self.history[-settings.session_context_limit :]

    def register(self, translation: GeminiTranslationResult) -> tuple[str, bool, str]:
        self.updated_at_ms = _now_ms()

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
            self.history = self.history[-settings.session_context_limit :]
            self.transcript.append(
                TranscriptItem(
                    text=cleaned,
                    timestamp_ms=self.updated_at_ms,
                    source="gemini",
                )
            )
            self.transcript = self.transcript[-settings.transcript_limit :]
            status = "Translated signed utterance."
        else:
            status = translation.notes or "Duplicate or low-signal segment skipped."

        self.last_status = status
        return cleaned, should_speak, status

    def to_payload(self) -> dict[str, Any]:
        return {
            "session_id": self.session_id,
            "created_at_ms": self.created_at_ms,
            "updated_at_ms": self.updated_at_ms,
            "transcript": [item.model_dump() for item in self.transcript],
            "history": self.history[-settings.session_context_limit :],
            "last_spoken_text": self.last_spoken_text,
            "last_status": self.last_status,
        }

    @classmethod
    def from_payload(cls, session_id: str, payload: dict[str, Any]) -> "SessionState":
        transcript = [
            TranscriptItem.model_validate(item)
            for item in payload.get("transcript", [])
        ]
        history = [
            str(item).strip()
            for item in payload.get("history", [])
            if str(item).strip()
        ]

        return cls(
            session_id=session_id,
            created_at_ms=int(payload.get("created_at_ms", _now_ms())),
            updated_at_ms=int(payload.get("updated_at_ms", _now_ms())),
            transcript=transcript[-settings.transcript_limit :],
            history=history[-settings.session_context_limit :],
            last_spoken_text=str(payload.get("last_spoken_text", "")),
            last_status=str(payload.get("last_status", "Waiting for video.")),
        )


class SessionStore:
    def __init__(self):
        self._sessions: dict[str, SessionState] = {}
        self.backend = "memory"
        self._redis = self._create_redis_client()

    def _create_redis_client(self):
        if not settings.redis_enabled:
            return None

        if Redis is None:
            raise RuntimeError(
                "Redis session persistence is configured, but upstash-redis is not "
                "installed. Run `pip install -r requirements.txt`."
            )

        self.backend = "upstash-redis"
        return Redis.from_env()

    def _redis_key(self, session_id: str) -> str:
        return f"signbridge:session:{session_id}"

    def _load_from_redis(self, session_id: str) -> SessionState | None:
        if self._redis is None:
            return None

        raw_payload = self._redis.get(self._redis_key(session_id))
        if raw_payload is None:
            return None

        if isinstance(raw_payload, bytes):
            raw_payload = raw_payload.decode("utf-8")

        try:
            payload = json.loads(raw_payload)
            return SessionState.from_payload(session_id, payload)
        except (TypeError, ValueError):
            return None

    def _save_to_redis(self, session: SessionState) -> None:
        if self._redis is None:
            return

        self._redis.set(
            self._redis_key(session.session_id),
            json.dumps(session.to_payload()),
            ex=settings.session_ttl_seconds,
        )

    def create(self) -> SessionState:
        session = SessionState(session_id=str(uuid4()))
        self.save(session)
        return session

    def get(self, session_id: str) -> SessionState:
        session = self._load_from_redis(session_id)
        if session is not None:
            return session

        if session_id not in self._sessions:
            self._sessions[session_id] = SessionState(session_id=session_id)

        return self._sessions[session_id]

    def save(self, session: SessionState) -> None:
        session.updated_at_ms = _now_ms()

        if self._redis is not None:
            self._save_to_redis(session)
            return

        self._sessions[session.session_id] = session
