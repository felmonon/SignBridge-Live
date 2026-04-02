import os
from dataclasses import dataclass
from pathlib import Path


def _load_dotenv() -> None:
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()

        if value and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]

        os.environ.setdefault(key, value)


_load_dotenv()


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "SignBridge Live")
    host: str = os.getenv("HOST", "127.0.0.1")
    port: int = int(os.getenv("PORT", "8000"))
    frontend_dist_dir: str = os.getenv(
        "FRONTEND_DIST_DIR",
        str(Path(__file__).resolve().parent.parent / "frontend" / "dist"),
    )

    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    default_sign_language: str = os.getenv("SIGN_LANGUAGE_HINT", "ASL")

    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    openai_tts_model: str = os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
    openai_tts_voice: str = os.getenv("OPENAI_TTS_VOICE", "coral")

    clip_seconds: float = float(os.getenv("CLIP_SECONDS", "3.0"))
    max_clip_bytes: int = int(os.getenv("MAX_CLIP_BYTES", str(15 * 1024 * 1024)))
    transcript_limit: int = int(os.getenv("TRANSCRIPT_LIMIT", "12"))
    session_context_limit: int = int(os.getenv("SESSION_CONTEXT_LIMIT", "6"))
    session_ttl_seconds: int = int(os.getenv("SESSION_TTL_SECONDS", "1800"))

    upstash_redis_rest_url: str | None = os.getenv("UPSTASH_REDIS_REST_URL")
    upstash_redis_rest_token: str | None = os.getenv("UPSTASH_REDIS_REST_TOKEN")

    @property
    def gemini_enabled(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def openai_tts_enabled(self) -> bool:
        return bool(self.openai_api_key)

    @property
    def redis_enabled(self) -> bool:
        return bool(self.upstash_redis_rest_url and self.upstash_redis_rest_token)


settings = Settings()
