"""WhatsApp Conversational Multi-Agent - Inbound lead qualification and automated messaging."""

from typing import Dict, Any, List, Optional
import time

from .base_agent import BaseAgent


class WhatsAppAgent(BaseAgent):
    """
    Autonomous WhatsApp Business Agent that:
    - Analyzes inbound customer & prospect WhatsApp chats
    - Classifies buyer intent (pricing, demo, meeting, support)
    - Formulates natural, high-conversion conversational replies
    - Detects when to hand off conversation to human account execs
    """

    def __init__(
        self,
        llm: Any = None,
        tools: Optional[List[Any]] = None,
        memory: Optional[Any] = None,
        redis_client: Optional[Any] = None,
    ):
        super().__init__(
            name="WhatsAppConversationalAgent",
            llm=llm,
            tools=tools or [],
            memory=memory,
            redis_client=redis_client,
        )

    async def handle_inbound_message(
        self,
        contact_name: str,
        phone_number: str,
        message_text: str,
        history: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Process inbound WhatsApp message and generate contextual response."""
        await self.log_activity(
            "whatsapp_message_received",
            {
                "contact": contact_name,
                "phone": phone_number,
            },
        )

        lower = message_text.lower()
        intent = "general_query"
        confidence = 0.92

        if any(w in lower for w in ["price", "pricing", "cost", "how much", "quote"]):
            intent = "pricing_inquiry"
        elif any(w in lower for w in ["demo", "see it", "walkthrough", "preview"]):
            intent = "demo_request"
        elif any(
            w in lower for w in ["meeting", "call", "schedule", "calendar", "time"]
        ):
            intent = "meeting_request"
        elif any(
            w in lower for w in ["human", "agent", "support", "help", "issue", "bug"]
        ):
            intent = "support_handoff"

        prompt = f"""You are the AI CRM WhatsApp Sales Assistant for enterprise clients.
Prospect: {contact_name} ({phone_number})
Incoming Message: "{message_text}"
Detected Intent: {intent}

Respond concisely (under 60 words), warmly, and professionally. Offer to schedule a quick meeting or provide next steps."""

        reply_text = ""
        try:
            if self.llm:
                reply_text = await self.think(prompt)
            else:
                if intent == "pricing_inquiry":
                    reply_text = f"Hi {contact_name}! 👋 Our plans start at $49/seat with full autonomous multi-agent fleet access. Would you like me to book a 15-minute tailored briefing with our solutions lead?"
                elif intent == "meeting_request" or intent == "demo_request":
                    reply_text = f"Absolutely {contact_name}! 🚀 I can lock in a personalized live demo for you. Does tomorrow at 2:00 PM UTC work, or would you prefer a morning slot?"
                elif intent == "support_handoff":
                    reply_text = f"I've alerted our senior customer success engineer right now, {contact_name}. They will join this chat momentarily to assist you directly!"
                else:
                    reply_text = f"Hello {contact_name}! Thank you for reaching out to AI-Powered CRM. How can our autonomous agents empower your revenue team today?"
        except Exception:
            reply_text = f"Hello {contact_name}! Thanks for your message. How can our AI CRM team assist you today?"

        return {
            "intent": intent,
            "confidence": confidence,
            "reply_text": reply_text,
            "suggested_actions": ["tag_warm_lead", "update_crm_stage"],
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        }

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute conversational WhatsApp task."""
        return await self.handle_inbound_message(
            contact_name=task.get("contact_name", "Prospect"),
            phone_number=task.get("phone_number", "+1000000000"),
            message_text=task.get("message_text", ""),
            history=task.get("history", []),
        )
