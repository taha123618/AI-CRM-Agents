"""Agent Orchestrator - Coordinates all AI agents"""

# pyrefly: ignore [missing-import]
import importlib
import os
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session

from agents import (
    LeadQualificationAgent,
    EmailIntelligenceAgent,
    SalesPipelineAgent,
    CustomerSuccessAgent,
    MeetingSchedulerAgent,
    AnalyticsAgent,
)


class AgentOrchestrator:
    """
    Central orchestrator that coordinates all AI agents
    Manages agent communication, task routing, and workflows
    """

    def __init__(self):
        # Initialize LLM (placeholder - use actual LLM client)
        self.llm = self._init_llm()

        # Initialize all agents
        self.lead_agent = LeadQualificationAgent(llm=self.llm)
        self.email_agent = EmailIntelligenceAgent(llm=self.llm)
        self.sales_agent = SalesPipelineAgent(llm=self.llm)
        self.success_agent = CustomerSuccessAgent(llm=self.llm)
        self.meeting_agent = MeetingSchedulerAgent(llm=self.llm)
        self.analytics_agent = AnalyticsAgent(llm=self.llm)

        self.agents = {
            "lead_qualification": self.lead_agent,
            "email_intelligence": self.email_agent,
            "sales_pipeline": self.sales_agent,
            "customer_success": self.success_agent,
            "meeting_scheduler": self.meeting_agent,
            "analytics": self.analytics_agent,
        }

    def _init_llm(self):
        """
        Initialize LLM client.
        Supports OpenAI (OPENAI_API_KEY) and Anthropic (ANTHROPIC_API_KEY).
        Falls back to a smart contextual AI response generator when keys are missing.
        """
        openai_key = os.getenv("OPENAI_API_KEY")
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")

        if openai_key and not openai_key.startswith("sk-your"):
            try:
                openai_mod = importlib.import_module("openai")
                AsyncOpenAI = getattr(openai_mod, "AsyncOpenAI")
                client = AsyncOpenAI(api_key=openai_key)

                class OpenAIWrapper:
                    async def agenerate(self, prompts):
                        prompt = (
                            prompts[0]
                            if isinstance(prompts, list) and prompts
                            else str(prompts)
                        )
                        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
                        response = await client.chat.completions.create(
                            model=model,
                            messages=[{"role": "user", "content": prompt}],
                            temperature=0.7,
                        )
                        text_out = response.choices[0].message.content or ""

                        class Generation:
                            def __init__(self, text):
                                self.text = text

                        class Generations:
                            def __init__(self, text):
                                self.generations = [[Generation(text)]]

                        return Generations(text_out)

                return OpenAIWrapper()
            except Exception as e:
                print(f"[AgentOrchestrator] Warning: OpenAI init failed: {e}")

        if anthropic_key and not anthropic_key.startswith("sk-ant-your"):
            try:
                anthropic_mod = importlib.import_module("anthropic")
                AsyncAnthropic = getattr(anthropic_mod, "AsyncAnthropic")
                client = AsyncAnthropic(api_key=anthropic_key)

                class AnthropicWrapper:
                    async def agenerate(self, prompts):
                        prompt = (
                            prompts[0]
                            if isinstance(prompts, list) and prompts
                            else str(prompts)
                        )
                        model = os.getenv(
                            "ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"
                        )
                        response = await client.messages.create(
                            model=model,
                            max_tokens=1024,
                            messages=[{"role": "user", "content": prompt}],
                            temperature=0.7,
                        )
                        text_out = response.content[0].text if response.content else ""

                        class Generation:
                            def __init__(self, text):
                                self.text = text

                        class Generations:
                            def __init__(self, text):
                                self.generations = [[Generation(text)]]

                        return Generations(text_out)

                return AnthropicWrapper()
            except Exception as e:
                print(f"[AgentOrchestrator] Warning: Anthropic init failed: {e}")

        # Smart Contextual Fallback LLM when no live API key is provided
        class SmartFallbackLLM:
            async def agenerate(self, prompts):
                prompt = (
                    prompts[0]
                    if isinstance(prompts, list) and prompts
                    else str(prompts)
                )
                prompt_lower = prompt.lower()

                if (
                    "agenda" in prompt_lower
                    or "meeting" in prompt_lower
                    or "schedule" in prompt_lower
                ):
                    text_out = (
                        "1. Review customer business objectives and requirements\n"
                        "2. Present technical architecture and integration workflow\n"
                        "3. Discuss pricing plans, licensing models, and timeline\n"
                        "4. Align on next steps, decision criteria, and implementation plan"
                    )
                elif (
                    "email" in prompt_lower
                    or "reply" in prompt_lower
                    or "draft" in prompt_lower
                ):
                    import re

                    name = "there"
                    name_match = re.search(r"From:\s*([^\n\r@]+)", prompt)
                    if name_match:
                        raw_name = name_match.group(1).strip()
                        if raw_name and raw_name.lower() != "there":
                            name = raw_name.title()
                    if name == "there":
                        email_match = re.search(r"From:\s*([a-zA-Z0-9._%+-]+)@", prompt)
                        if email_match:
                            name = (
                                email_match.group(1)
                                .replace(".", " ")
                                .replace("_", " ")
                                .title()
                            )

                    subject_match = re.search(r"Subject:\s*([^\n\r]+)", prompt)
                    subj = (
                        subject_match.group(1).strip()
                        if subject_match
                        else "your inquiry"
                    )

                    text_out = (
                        f"Hi {name},\n\n"
                        f"Thank you for reaching out regarding {subj}! We appreciate your interest in our platform. "
                        "Our team has reviewed your request and would be delighted to assist you. "
                        "We can share our security compliance documentation and schedule a dedicated walkthrough "
                        "to discuss your custom requirements and pricing options.\n\n"
                        "Please let us know what times work best for your schedule this week.\n\n"
                        "Best regards,\n"
                        "Sales Intelligence Team\n"
                        "AI-Powered CRM Solutions"
                    )
                elif (
                    "qualification" in prompt_lower
                    or "score" in prompt_lower
                    or "lead" in prompt_lower
                ):
                    text_out = (
                        "High priority lead with strong buying intent. Budget aligns with Enterprise tier. "
                        "Key decision maker identified. Recommended action: Fast-track to direct sales demo."
                    )
                elif (
                    "churn" in prompt_lower
                    or "risk" in prompt_lower
                    or "customer" in prompt_lower
                ):
                    text_out = (
                        "Account shows stable engagement but key license usage is under 60%. "
                        "Recommended action: Schedule proactive Customer Success check-in and offer onboarding session."
                    )
                else:
                    text_out = (
                        "Analyzed input context successfully. Action plan generated: "
                        "Verify requirement specifications, align stakeholder priorities, and execute next milestones."
                    )

                class Generation:
                    def __init__(self, text):
                        self.text = text

                class Generations:
                    def __init__(self, text):
                        self.generations = [[Generation(text)]]

                return Generations(text_out)

        return SmartFallbackLLM()

    def get_agent_status(self) -> Dict[str, str]:
        """Get status of all agents"""
        return {name: "active" for name in self.agents.keys()}

    # ========================================================================
    # WORKFLOW: New Lead Processing
    # ========================================================================

    async def process_new_lead(self, lead_data: Dict[str, Any], db: Session):
        """
        Complete workflow for processing a new lead:
        1. Lead Qualification Agent scores and enriches
        2. Email Intelligence Agent drafts welcome email
        3. Meeting Scheduler Agent proposes meeting times
        """

        # Step 1: Qualify lead
        qualification_result = await self.lead_agent.execute({"lead_data": lead_data})

        # Save to database
        from database.models import Contact

        email_str = lead_data.get("email")
        existing_contact = (
            db.query(Contact).filter(Contact.email == email_str).first()
            if email_str
            else None
        )

        score_val = qualification_result.get("score", 50)
        status_val = "qualified" if score_val >= 60 else "new"

        if existing_contact:
            if lead_data.get("first_name"):
                existing_contact.first_name = lead_data.get("first_name")
            if lead_data.get("last_name"):
                existing_contact.last_name = lead_data.get("last_name")
            if lead_data.get("job_title"):
                existing_contact.job_title = lead_data.get("job_title")
            existing_contact.lead_score = score_val
            existing_contact.lead_status = status_val
            existing_contact.enrichment_data = qualification_result.get("enriched_data")
            contact = existing_contact
        else:
            contact = Contact(
                email=email_str,
                first_name=lead_data.get("first_name"),
                last_name=lead_data.get("last_name"),
                job_title=lead_data.get("job_title"),
                lead_score=score_val,
                lead_status=status_val,
                enrichment_data=qualification_result.get("enriched_data"),
            )
            db.add(contact)

        db.commit()

        # Step 2: Draft welcome email (if high score)
        if qualification_result.get("score", 0) >= 70:
            email_task = {
                "email_data": {
                    "from": lead_data.get("email"),
                    "body": f"New high-value lead: {lead_data.get('first_name')}",
                    "subject": "Welcome",
                }
            }
            await self.email_agent.execute(email_task)

        # Step 3: Suggest meeting (if very high score)
        if qualification_result.get("score", 0) >= 80:
            meeting_task = {
                "action": "suggest_times",
                "attendees": [lead_data.get("email")],
                "duration": 30,
            }
            await self.meeting_agent.execute(meeting_task)

        return qualification_result

    # ========================================================================
    # WORKFLOW: Email Processing
    # ========================================================================

    async def process_email(self, email_data: Dict[str, Any], db: Session):
        """
        Process incoming email:
        1. Email Intelligence Agent analyzes sentiment and drafts response
        2. If negative sentiment, alert Customer Success
        3. Create activity record
        """

        # Analyze email
        analysis_result = await self.email_agent.execute({"email_data": email_data})

        # Save to database
        from database.models import Email

        email = Email(
            from_email=email_data.get("from") or email_data.get("sender"),
            to_email=email_data.get("to") or "sales@company.com",
            subject=email_data.get("subject"),
            body=email_data.get("body"),
            direction="inbound",
            sentiment=analysis_result.get("sentiment", {}).get("label"),
            sentiment_score=analysis_result.get("sentiment", {}).get("score"),
            category=analysis_result.get("category"),
            priority=analysis_result.get("priority"),
            draft_response=analysis_result.get("draft_response"),
        )
        db.add(email)
        db.commit()

        # If negative, alert customer success
        if analysis_result.get("sentiment", {}).get("score", 5) <= 3:
            # Trigger customer success workflow
            print(f"ALERT: Negative email from {email_data.get('from')}")

        return analysis_result

    # ========================================================================
    # WORKFLOW: Deal Analysis
    # ========================================================================

    async def analyze_deal(self, deal_id: str, db: Session):
        """
        Analyze deal health:
        1. Sales Pipeline Agent assesses health and risk
        2. If stalled, Meeting Scheduler suggests follow-up
        3. Update deal record with insights
        """

        # Analyze deal
        analysis_result = await self.sales_agent.execute(
            {"deal_id": deal_id, "action": "analyze"}
        )

        # Update deal in database
        from database.models import Deal

        deal = db.query(Deal).filter(Deal.id == deal_id).first()
        if deal:
            deal.health_score = analysis_result.get("health_score", 50)
            deal.is_stalled = analysis_result.get("is_stalled", False)
            deal.risk_factors = analysis_result.get("risk_factors", [])
            deal.probability = analysis_result.get(
                "close_probability", deal.probability or 50
            )
            # Persist AI next_actions and forecast into metadata
            meta = dict(deal.additional_metadata or {})
            meta["next_actions"] = analysis_result.get("next_actions", [])
            meta["forecast_close_date"] = analysis_result.get("forecast_close_date", "")
            deal.additional_metadata = meta
            db.commit()

        # If stalled, schedule follow-up
        if analysis_result.get("is_stalled"):
            meeting_task = {
                "action": "schedule",
                "meeting_type": "follow_up",
                "attendees": [deal.contact.email] if deal.contact else [],
                "subject": f"Follow-up: {deal.name}",
            }
            await self.meeting_agent.execute(meeting_task)

        return analysis_result

    # ========================================================================
    # WORKFLOW: Customer Health Monitoring
    # ========================================================================

    async def monitor_customer(self, customer_id: str, db: Session):
        """
        Monitor customer health:
        1. Customer Success Agent calculates health score
        2. If churn risk, trigger retention workflow
        3. Identify upsell opportunities
        """

        # Monitor customer
        monitoring_result = await self.success_agent.execute(
            {"customer_id": customer_id, "action": "monitor"}
        )

        # Update customer in database
        from database.models import Customer

        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if customer:
            customer.health_score = monitoring_result.get("health_score", 50)
            customer.churn_risk = monitoring_result.get("churn_risk", {}).get(
                "level", "low"
            )
            customer.churn_probability = monitoring_result.get("churn_risk", {}).get(
                "probability", 0
            )
            # Persist AI recommended actions into metadata
            meta = dict(customer.additional_metadata or {})
            meta["recommended_actions"] = monitoring_result.get(
                "recommended_actions", []
            )
            customer.additional_metadata = meta
            db.commit()

        # If high churn risk, alert team
        if monitoring_result.get("churn_risk", {}).get("level") in ["high", "critical"]:
            print(f"ALERT: High churn risk for customer {customer_id}")
            # Could trigger email, Slack notification, etc.

        return monitoring_result

    # ========================================================================
    # WORKFLOW: Meeting Scheduling
    # ========================================================================

    async def schedule_meeting(self, meeting_request: Dict[str, Any], db: Session):
        """
        Schedule meeting:
        1. Meeting Scheduler finds available times
        2. Creates meeting record
        3. Generates prep materials
        """

        # Schedule meeting
        meeting_result = await self.meeting_agent.execute(
            {"action": "schedule", **meeting_request}
        )

        # Save to database
        from database.models import Meeting

        title_val = (
            meeting_result.get("subject")
            or meeting_request.get("title")
            or meeting_request.get("subject")
        )
        if not title_val or not str(title_val).strip():
            title_val = meeting_request.get("title") or "Executive Architecture Review"

        notes_val = meeting_request.get("notes")
        if not notes_val and isinstance(meeting_result.get("prep_materials"), dict):
            notes_val = meeting_result.get("prep_materials", {}).get("prep_notes")

        meeting = Meeting(
            title=title_val,
            meeting_type=meeting_result.get("type")
            or meeting_request.get("meeting_type")
            or "Technical Review",
            scheduled_at=meeting_result.get("scheduled_time") or datetime.now(),
            duration_minutes=meeting_result.get("duration_minutes") or 30,
            location=meeting_result.get("location") or "Google Meet (auto-generated)",
            attendees=meeting_result.get("attendees"),
            agenda=meeting_result.get("agenda"),
            prep_materials=meeting_result.get("prep_materials"),
            notes=notes_val,
            status="scheduled",
        )
        db.add(meeting)
        db.commit()

        return meeting_result

    # ========================================================================
    # WORKFLOW: Analytics Dashboard
    # ========================================================================

    async def generate_dashboard(self, category: str, db: Session):
        """
        Generate analytics dashboard:
        1. Analytics Agent collects metrics
        2. Calculates KPIs
        3. Generates insights
        """

        dashboard = await self.analytics_agent.execute(
            {"action": "dashboard", "category": category}
        )

        return dashboard

    # ========================================================================
    # AUTOMATED WORKFLOWS (Run Periodically)
    # ========================================================================

    async def run_daily_workflows(self, db: Session):
        """Run daily automated workflows"""

        # 1. Check all deals for stalled status
        from database.models import Deal

        active_deals = (
            db.query(Deal)
            .filter(
                Deal.stage.in_(
                    ["prospecting", "qualification", "proposal", "negotiation"]
                )
            )
            .all()
        )

        for deal in active_deals:
            await self.analyze_deal(str(deal.id), db)

        # 2. Monitor all customers
        from database.models import Customer

        customers = db.query(Customer).all()

        for customer in customers:
            await self.monitor_customer(str(customer.id), db)

        # 3. Generate daily metrics
        await self.analytics_agent.execute(
            {"action": "report", "report_type": "weekly_sales"}
        )

        print("Daily workflows completed")

    async def run_weekly_workflows(self, db: Session):
        """Run weekly automated workflows"""

        # Generate executive report
        report = await self.analytics_agent.execute(
            {"action": "report", "report_type": "monthly_executive"}
        )

        # Analyze pipeline health
        pipeline_health = await self.analytics_agent.execute(
            {"action": "report", "report_type": "pipeline_health"}
        )

        print("Weekly workflows completed")
        return {"report": report, "pipeline_health": pipeline_health}
