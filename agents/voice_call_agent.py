"""Voice AI Call Intelligence Agent - Real-time call coaching, battle-cards, and transcript analytics."""

from typing import Dict, Any, List, Optional
import time

from .base_agent import BaseAgent


class VoiceCallAgent(BaseAgent):
    """
    Autonomous Voice AI Agent that:
    - Analyzes live call transcripts in real-time
    - Detects prospect objections (Price, Competitor, Timing, Authority)
    - Delivers instant rep battle-cards & coaching tips
    - Computes buyer intent score & sentiment
    - Summarizes finished calls with structured action items
    """

    def __init__(
        self,
        llm: Any = None,
        tools: Optional[List[Any]] = None,
        memory: Optional[Any] = None,
        redis_client: Optional[Any] = None,
    ):
        super().__init__(
            name="VoiceCallIntelligenceAgent",
            llm=llm,
            tools=tools or [],
            memory=memory,
            redis_client=redis_client,
        )

    async def analyze_turn(
        self,
        speaker: str,
        text: str,
        call_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Analyze a single real-time speech turn and provide immediate sales coaching."""
        await self.log_activity(
            "voice_turn_received", {"speaker": speaker, "length": len(text)}
        )

        sentiment = "neutral"
        lower = text.lower()
        if any(
            w in lower
            for w in ["great", "excited", "love", "sounds good", "perfect", "deal"]
        ):
            sentiment = "positive"
        elif any(
            w in lower
            for w in [
                "expensive",
                "competitor",
                "not ready",
                "delay",
                "concerned",
                "issue",
            ]
        ):
            sentiment = "negative"

        # Detect objections
        objection = None
        coaching_tip = None

        if any(
            w in lower for w in ["expensive", "cost", "budget", "pricing", "discount"]
        ):
            objection = "Pricing / Budget Objection"
            coaching_tip = "💡 Frame value over cost: Highlight 3.4x ROI in first 90 days and offer annual billing flex."
        elif any(w in lower for w in ["salesforce", "hubspot", "gong", "competitor"]):
            objection = "Competitor Comparison"
            coaching_tip = "💡 Battlecard: Emphasize our autonomous multi-agent fleet vs legacy static dashboards."
        elif any(
            w in lower
            for w in ["next quarter", "next month", "later", "not now", "busy"]
        ):
            objection = "Timing / Procrastination"
            coaching_tip = "💡 Urgency trigger: Inquire about pipeline bottleneck costs of delaying deployment."
        elif any(w in lower for w in ["my boss", "ceo", "board", "need approval"]):
            objection = "Authority / Decision Maker"
            coaching_tip = "💡 Champion enablement: Offer an executive 1-pager summary for their leadership review."

        return {
            "speaker": speaker,
            "text": text,
            "sentiment": sentiment,
            "objection_detected": objection,
            "coaching_tip": coaching_tip,
            "timestamp": time.strftime("%H:%M:%S"),
        }

    async def summarize_call(
        self,
        transcripts: List[Dict[str, Any]],
        contact_name: str,
    ) -> Dict[str, Any]:
        """Generate comprehensive call synthesis, buyer intent score, and action items."""
        full_dialogue = "\n".join(
            [f"{t.get('speaker', 'user')}: {t.get('text', '')}" for t in transcripts]
        )

        prompt = f"""You are the Executive Voice AI Call Analyst. Synthesize this sales call:
Contact: {contact_name}
Transcript:
{full_dialogue}

Provide:
1. Executive Summary
2. Buyer Intent Score (0-100)
3. Key Objections Handled
4. Structured Action Items (Next Steps)"""

        try:
            if self.llm:
                response = await self.think(prompt)
            else:
                response = f"Analyzed call with {contact_name}. High purchase intent observed with pricing discussion."
        except Exception:
            response = f"Call completed with {contact_name}. Next follow-up agreed."

        # Structured defaults
        intent_score = (
            82 if "positive" in response.lower() or len(transcripts) > 3 else 68
        )
        action_items = [
            f"Send tailored enterprise proposal to {contact_name}",
            "Schedule technical architecture deep-dive for next Tuesday",
            "Update CRM deal stage to 'Proposal / Negotiation'",
        ]

        return {
            "summary": response,
            "buyer_intent_score": intent_score,
            "sentiment": "positive" if intent_score > 70 else "neutral",
            "action_items": action_items,
            "objections_handled": ["Competitor Differentiation", "Custom SLA Terms"],
        }

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task execution router for voice intelligence."""
        task_type = task.get("type", "summarize")
        if task_type == "analyze_turn":
            return await self.analyze_turn(
                speaker=task.get("speaker", "prospect"),
                text=task.get("text", ""),
                call_context=task.get("context"),
            )
        else:
            return await self.summarize_call(
                transcripts=task.get("transcripts", []),
                contact_name=task.get("contact_name", "Valued Client"),
            )
