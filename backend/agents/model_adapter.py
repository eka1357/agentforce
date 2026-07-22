import os
import asyncio
from abc import ABC, abstractmethod
from typing import AsyncGenerator, List

class ModelAdapter(ABC):
    @abstractmethod
    async def generate_stream(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens as strings."""
        pass

# List of 100% free models on OpenRouter
FREE_MODELS: List[str] = [
    "openai/gpt-oss-20b:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "deepseek/deepseek-r1:free",
    "mistralai/mistral-7b-instruct:free"
]

class OpenRouterAdapter(ModelAdapter):
    """Unified OpenRouter adapter using 100% free models with structured error handling."""
    def __init__(self, model_id: str = None, api_key: str = None):
        self.model_id = model_id or FREE_MODELS[0]
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY") or os.getenv("ANTHROPIC_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")

    async def generate_stream(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        # Validate API Key presence
        if not self.api_key or self.api_key.startswith("sk-placeholder"):
            raise ValueError("Missing OPENROUTER_API_KEY in .env file. Please configure a valid API key.")

        import openai
        client = openai.AsyncOpenAI(
            api_key=self.api_key,
            base_url="https://openrouter.ai/api/v1",
            default_headers={
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "AgentForge Visual Orchestrator"
            }
        )

        candidate_models = [self.model_id]
        for free_m in FREE_MODELS:
            if free_m not in candidate_models:
                candidate_models.append(free_m)

        last_error = None
        for model in candidate_models:
            try:
                response = await client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt or "You are a helpful AI assistant."},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=temperature,
                    stream=True
                )

                has_streamed_any = False
                async for chunk in response:
                    if chunk.choices and len(chunk.choices) > 0:
                        delta = chunk.choices[0].delta
                        if hasattr(delta, "content") and delta.content:
                            has_streamed_any = True
                            yield delta.content

                if has_streamed_any:
                    return  # Clean success!

            except openai.AuthenticationError as e:
                raise ValueError(f"Invalid OpenRouter API Key provided for model '{model}'. (401 Unauthorized)")
            except openai.RateLimitError as e:
                last_error = f"Rate Limit Exceeded for model '{model}'."
                continue
            except openai.NotFoundError as e:
                last_error = f"Model endpoint '{model}' not found on provider."
                continue
            except openai.APIConnectionError as e:
                raise ValueError("Failed to connect to OpenRouter network API endpoint. Check internet connection.")
            except openai.APIError as e:
                last_error = f"OpenRouter API Error ({e.status_code}): {e.message}"
                continue
            except Exception as e:
                last_error = str(e)
                continue

        # If all candidates failed, raise structured ValueError for canvas
        raise ValueError(f"Provider Error ({self.model_id}): {last_error or 'All fallback model attempts failed.'}")

class AnthropicAdapter(OpenRouterAdapter):
    def __init__(self, api_key: str = None):
        super().__init__(model_id="meta-llama/llama-3.3-70b-instruct:free", api_key=api_key)

class OpenAIAdapter(OpenRouterAdapter):
    def __init__(self, api_key: str = None):
        super().__init__(model_id="openai/gpt-oss-20b:free", api_key=api_key)

class GeminiAdapter(OpenRouterAdapter):
    def __init__(self, api_key: str = None):
        super().__init__(model_id="google/gemini-2.0-flash-exp:free", api_key=api_key)

class ModelAdapterFactory:
    @staticmethod
    def get_adapter(provider: str, model_name: str = None) -> ModelAdapter:
        provider_lower = (provider or "anthropic").lower()
        openrouter_key = os.getenv("OPENROUTER_API_KEY")

        free_model_map = {
            "anthropic": "meta-llama/llama-3.3-70b-instruct:free",
            "openai": "openai/gpt-oss-20b:free",
            "gemini": "google/gemini-2.0-flash-exp:free"
        }

        if openrouter_key:
            target_model = model_name if (model_name and "/" in model_name) else free_model_map.get(provider_lower, "openai/gpt-oss-20b:free")
            return OpenRouterAdapter(model_id=target_model, api_key=openrouter_key)

        if provider_lower == "anthropic":
            return AnthropicAdapter()
        elif provider_lower == "openai":
            return OpenAIAdapter()
        elif provider_lower == "gemini":
            return GeminiAdapter()
        else:
            return OpenAIAdapter()
