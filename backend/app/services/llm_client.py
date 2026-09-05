import os
from typing import List, Dict

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


class GeminiClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY", "").strip()

        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is missing in backend/.env"
            )

        self.client = genai.Client(api_key=api_key)

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> str:

        prompt = f"""
SYSTEM:
{system_prompt}

USER:
{user_prompt}
"""

        response = self.client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            ),
        )

        if response.text:
            return response.text.strip()

        raise RuntimeError("Gemini returned an empty response.")

    def chat(
        self,
        system_prompt: str,
        messages: List[Dict],
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> str:

        conversation = f"SYSTEM:\n{system_prompt}\n\n"

        for msg in messages:
            role = msg.get("role", "user").upper()
            content = msg.get("content", "")
            conversation += f"{role}:\n{content}\n\n"

        response = self.client.models.generate_content(
            model=GEMINI_MODEL,
            contents=conversation,
            config=types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            ),
        )

        if response.text:
            return response.text.strip()

        raise RuntimeError("Gemini returned an empty response.")


_client = GeminiClient()


def call_gemini(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.3,
    max_tokens: int = 4096,
) -> str:
    return _client.generate(
        system_prompt,
        user_prompt,
        temperature,
        max_tokens,
    )


def call_gemini_multiturn(
    system_prompt: str,
    messages: List[Dict],
    temperature: float = 0.3,
    max_tokens: int = 4096,
) -> str:
    return _client.chat(
        system_prompt,
        messages,
        temperature,
        max_tokens,
    )