import pytest
import os
from backend.agents.model_adapter import OpenRouterAdapter, ModelAdapterFactory

@pytest.mark.asyncio
async def test_missing_api_key_raises_clean_error():
    adapter = OpenRouterAdapter(model_id="openai/gpt-oss-20b:free", api_key=None)

    with pytest.raises(ValueError) as exc_info:
        async for _ in adapter.generate_stream(system_prompt="Test", user_prompt="Hello"):
            pass

    assert "Missing OPENROUTER_API_KEY" in str(exc_info.value)

def test_model_adapter_factory_returns_openrouter_adapter():
    os.environ["OPENROUTER_API_KEY"] = "sk-or-v1-testkey"
    adapter = ModelAdapterFactory.get_adapter("anthropic", "meta-llama/llama-3.3-70b-instruct:free")
    assert isinstance(adapter, OpenRouterAdapter)
    assert adapter.model_id == "meta-llama/llama-3.3-70b-instruct:free"
