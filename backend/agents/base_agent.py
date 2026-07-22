import asyncio
from typing import Callable, Any, Dict
from backend.agents.model_adapter import ModelAdapterFactory

class BaseAgent:
    def __init__(
        self,
        node_id: str,
        label: str,
        system_prompt: str = "",
        model_provider: str = "anthropic",
        model_name: str = "claude-3-5-sonnet-20241022",
        temperature: float = 0.7
    ):
        self.node_id = node_id
        self.label = label
        self.system_prompt = system_prompt
        self.model_provider = model_provider
        self.model_name = model_name
        self.temperature = temperature
        self.adapter = ModelAdapterFactory.get_adapter(model_provider, model_name)

    async def execute_stream(
        self,
        input_payload: Dict[str, Any],
        event_callback: Callable[[str, Dict[str, Any]], None]
    ) -> str:
        """
        Executes the agent logic, streaming tokens via event_callback.
        Returns the accumulated full response string.
        """
        # Format user prompt from upstream inputs
        if isinstance(input_payload, dict) and input_payload:
            formatted_inputs = []
            for k, v in input_payload.items():
                formatted_inputs.append(f"Input from {k}:\n{v}")
            user_prompt = "\n\n".join(formatted_inputs)
        elif input_payload:
            user_prompt = str(input_payload)
        else:
            user_prompt = f"Execute initial task for agent '{self.label}'."

        # Emit start event
        await event_callback("start", {
            "node_id": self.node_id,
            "label": self.label,
            "provider": self.model_provider
        })

        accumulated_text = ""
        try:
            async for token in self.adapter.generate_stream(
                system_prompt=self.system_prompt,
                user_prompt=user_prompt,
                temperature=self.temperature
            ):
                accumulated_text += token
                await event_callback("token", {
                    "node_id": self.node_id,
                    "token": token,
                    "accumulated": accumulated_text
                })

            await event_callback("end", {
                "node_id": self.node_id,
                "output": accumulated_text
            })
            return accumulated_text

        except Exception as e:
            error_msg = str(e)
            await event_callback("error", {
                "node_id": self.node_id,
                "error": error_msg
            })
            raise e
