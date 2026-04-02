from openai import OpenAI

from app.config import settings


VOICE_INSTRUCTIONS = (
    "Speak as a neutral live interpreter for a signer in a video conversation. "
    "Use clear, natural conversational English."
)


class OpenAITTSService:
    def __init__(self):
        self.enabled = settings.openai_tts_enabled
        self.client = (
            OpenAI(api_key=settings.openai_api_key) if self.enabled else None
        )

    def synthesize(self, text: str) -> bytes:
        if not self.enabled or self.client is None:
            raise RuntimeError("OPENAI_API_KEY is not set.")

        response = self.client.audio.speech.create(
            model=settings.openai_tts_model,
            voice=settings.openai_tts_voice,
            input=text,
            instructions=VOICE_INSTRUCTIONS,
            response_format="wav",
        )
        return response.read()
