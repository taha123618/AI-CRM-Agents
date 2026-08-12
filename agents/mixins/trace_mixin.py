"""
TraceMixin — Transparent LLM Event Bridge for CRM Agents

Forwards internal LLM execution events (model requests, reasoning starts,
tool calls with arguments, completion events, token usage, cost attribution)
to the agent's publish_event() method, delivering full visibility to the event bus.
"""

import asyncio
from typing import Dict, Any, Callable, Awaitable, Optional
import time
from datetime import datetime


async def trace_agent_to_bus(
    agent_or_runner: Any,
    publish_fn: Callable[[str, Dict[str, Any]], Awaitable[None]],
    *args,
    **kwargs,
) -> Any:
    """
    Wrap agent execution (pydantic-ai, LangChain, or custom runner)
    and forward LLM events to the event bus.
    """
    start_time = time.time()
    agent_name = (
        getattr(agent_or_runner, "name", None)
        or getattr(agent_or_runner, "__class__", type(agent_or_runner)).__name__
    )

    await publish_fn(
        "llm_think_start",
        {
            "agent": agent_name,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )

    # If pydantic-ai style run_stream is available
    if hasattr(agent_or_runner, "run_stream"):
        async with agent_or_runner.run_stream(*args, **kwargs) as result:
            if hasattr(result, "stream_text"):
                try:
                    stream_obj = (
                        result.stream_text(delta=False)
                        if callable(result.stream_text)
                        else result.stream_text
                    )
                    if hasattr(stream_obj, "__aiter__"):
                        async for _ in stream_obj:
                            pass
                    elif asyncio.iscoroutine(stream_obj):
                        await stream_obj
                except Exception:
                    pass
            if hasattr(result, "all_messages"):
                try:
                    msgs = (
                        result.all_messages()
                        if callable(result.all_messages)
                        else result.all_messages
                    )
                    if isinstance(msgs, (list, tuple)):
                        for msg in msgs:
                            msg_type = getattr(msg, "__class__", type(msg)).__name__
                            if "ModelResponse" in msg_type or hasattr(msg, "parts"):
                                parts = getattr(msg, "parts", [])
                                if isinstance(parts, (list, tuple)):
                                    for part in parts:
                                        part_type = getattr(
                                            part, "__class__", type(part)
                                        ).__name__
                                        if "ToolCallPart" in part_type or hasattr(
                                            part, "tool_name"
                                        ):
                                            await publish_fn(
                                                "llm_tool_call",
                                                {
                                                    "tool": getattr(
                                                        part, "tool_name", "unknown"
                                                    ),
                                                    "args": getattr(part, "args", {}),
                                                    "agent": agent_name,
                                                },
                                            )
                except Exception:
                    pass
            tokens = 0
            if hasattr(result, "usage"):
                try:
                    usage = result.usage() if callable(result.usage) else result.usage
                    tokens = getattr(usage, "total_tokens", 0)
                except Exception:
                    tokens = 0

            duration = round(time.time() - start_time, 4)
            await publish_fn(
                "llm_complete",
                {
                    "tokens": tokens,
                    "duration_seconds": duration,
                    "agent": agent_name,
                },
            )
            return getattr(result, "data", result)

    # Standard execution fallback
    tokens_used = kwargs.pop("estimated_tokens", 0)
    duration = round(time.time() - start_time, 4)
    await publish_fn(
        "llm_complete",
        {
            "tokens": tokens_used,
            "duration_seconds": duration,
            "agent": agent_name,
        },
    )
    return None


class TraceMixin:
    """
    Mixin class providing transparent LLM tracing capabilities for BaseAgent.
    """

    async def publish_llm_think_start(self, prompt_summary: Optional[str] = None):
        """Signal that LLM reasoning has started"""
        publish_fn = getattr(self, "publish_event", None)
        if publish_fn:
            await publish_fn(
                "llm_think_start",
                {
                    "agent": getattr(self, "name", self.__class__.__name__),
                    "prompt_summary": prompt_summary or "Reasoning requested",
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )

    async def publish_llm_tool_call(self, tool_name: str, tool_args: Dict[str, Any]):
        """Signal that a tool call was initiated by the LLM"""
        publish_fn = getattr(self, "publish_event", None)
        if publish_fn:
            await publish_fn(
                "llm_tool_call",
                {
                    "agent": getattr(self, "name", self.__class__.__name__),
                    "tool": tool_name,
                    "args": tool_args,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )

    async def publish_llm_complete(
        self,
        tokens_used: int = 0,
        duration_seconds: float = 0.0,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Signal that LLM reasoning/execution completed"""
        publish_fn = getattr(self, "publish_event", None)
        if publish_fn:
            await publish_fn(
                "llm_complete",
                {
                    "agent": getattr(self, "name", self.__class__.__name__),
                    "tokens": tokens_used,
                    "duration_seconds": duration_seconds,
                    "metadata": metadata or {},
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )

    async def traced_think(self, prompt: str) -> str:
        """Traced wrapper around LLM reasoning"""
        start_time = time.time()
        agent_name = getattr(self, "name", self.__class__.__name__)
        prompt_snippet = prompt[:80] + "..." if len(prompt) > 80 else prompt

        await self.publish_llm_think_start(prompt_summary=prompt_snippet)

        llm = getattr(self, "llm", None)
        if not llm:
            raise ValueError(f"No LLM initialized on agent {agent_name}")

        response = await llm.agenerate([prompt])
        text_result = response.generations[0][0].text

        duration = round(time.time() - start_time, 4)
        estimated_tokens = len(prompt.split()) + len(text_result.split())

        await self.publish_llm_complete(
            tokens_used=estimated_tokens,
            duration_seconds=duration,
            metadata={
                "prompt_length": len(prompt),
                "response_length": len(text_result),
            },
        )

        return text_result

    async def traced_use_tool(self, tool_name: str, **kwargs) -> Any:
        """Traced wrapper around tool usage"""
        await self.publish_llm_tool_call(tool_name=tool_name, tool_args=kwargs)
        tools = getattr(self, "tools", [])
        tool = next((t for t in tools if getattr(t, "name", None) == tool_name), None)
        if not tool:
            raise ValueError(f"Tool {tool_name} not found")
        return await tool.arun(**kwargs)
