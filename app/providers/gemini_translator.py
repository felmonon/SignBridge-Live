import base64
import json

from google import genai
from google.genai import types

from app.config import settings
from app.schemas import GeminiTranslationResult, TRANSLATION_JSON_SCHEMA


SYSTEM_PROMPT = """You translate natural sign-language webcam clips into concise English.

Rules:
- Focus on the intended signed utterance, not visual description.
- Assume the signer may be using conversational sign language, not fingerspelling.
- Use the supplied recent conversation context only to resolve obvious continuity.
- If the clip does not contain a clear signed utterance, set signing_detected=false.
- If meaning is too uncertain, keep translation empty and set should_emit=false.
- Be conservative. Do not hallucinate missing words.
- Return JSON only.
"""


class GeminiVideoTranslator:
    def __init__(self):
        self.enabled = settings.gemini_enabled
        self.client = (
            genai.Client(api_key=settings.gemini_api_key) if self.enabled else None
        )

    def translate_clip(
        self,
        *,
        video_bytes: bytes,
        mime_type: str,
        sign_language_hint: str,
        conversation_context: list[str],
    ) -> GeminiTranslationResult:
        if not self.enabled or self.client is None:
            raise RuntimeError("GEMINI_API_KEY is not set.")

        context_block = "\n".join(f"- {line}" for line in conversation_context) or "- None"
        user_prompt = (
            f"Sign language hint: {sign_language_hint}\n"
            f"Recent conversation context:\n{context_block}\n\n"
            "Analyze the attached webcam video clip and translate the signer into natural English. "
            "If this clip is only a partial phrase or no clear signing is visible, do not emit a translation."
        )

        response = self.client.models.generate_content(
            model=settings.gemini_model,
            contents=[
                user_prompt,
                types.Part.from_bytes(data=video_bytes, mime_type=mime_type),
            ],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=TRANSLATION_JSON_SCHEMA,
            ),
        )

        if response.parsed:
            parsed = response.parsed
        elif response.text:
            parsed = json.loads(response.text)
        else:
            raise RuntimeError("Gemini returned an empty response.")

        return GeminiTranslationResult.model_validate(parsed)
