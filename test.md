## 🏗️ Architecture
### **9 Autonomous Agents**

1. **Lead Qualification Agent** 🎯
   - Scores incoming leads automatically
   - Routes high-value prospects to sales
   - Enriches contact data from public sources
   - Identifies buying signals

2. **Email Intelligence Agent** 📧
   - Drafts personalized responses
   - Sentiment analysis on customer emails
   - Auto-categorization and prioritization
   - Smart follow-up suggestions

3. **Sales Pipeline Agent** 💰
   - Tracks deal progress
   - Predicts close probability
   - Identifies stalled deals
   - Recommends next actions

4. **Customer Success Agent** 🎉
   - Monitors customer health scores
   - Detects churn risk
   - Triggers retention workflows
   - Upsell/cross-sell opportunities

5. **Meeting Scheduler Agent** 📅
   - Smart calendar management
   - Context-aware scheduling
   - Automatic meeting prep
   - Follow-up task creation

6. **Analytics Agent** 📊
   - Real-time dashboards
   - Predictive analytics
   - Performance insights
   - Custom reports

7. **Voice Call Intelligence Agent** 🎙️
   - Real-time speech turn analysis
   - Buyer intent scoring (0–100)
   - Dynamic objection battle-cards
   - Post-call CRM synthesis & action items
   - Sentiment distribution analytics

8. **WhatsApp Business Agent** 💬
   - 24/7 AI Auto-Pilot messaging
   - Customer intent classification
   - Broadcast template campaigns
   - Conversation tagging & archiving
   - Read receipts & unread tracking

9. **Custom Agent Builder** 🔧
   - No-code visual agent creation
   - Custom prompt & trigger configuration
   - Toolkit selection & integration
   - Live testing playground

## 🚀 Features

### **Core CRM**
- Contact & company management
- Deal pipeline tracking
- Task & activity logging
- Email integration
- Calendar sync

### **AI-Powered**
- Automatic lead scoring
- Intelligent email responses
- Sentiment analysis
- Churn prediction
- Sales forecasting
- Smart notifications

### **Agentic Workflows**
- Autonomous lead nurturing
- Auto-follow-up sequences
- Deal health monitoring
- Customer success automation
- Meeting coordination
- Data enrichment

### **Voice AI Call Intelligence**
- Real-time speech turn analysis
- Buyer intent scoring & coaching
- Objection frequency analytics
- Call sentiment distribution
- Interactive transcript viewer
- Post-call action item extraction

### **WhatsApp Business Hub**
- Omnichannel AI chat
- Broadcast template campaigns
- Conversation search & tagging
- Auto-pilot toggle per conversation
- New conversation & bulk send modals

### **Advanced Revenue Forecasting**
- Monte Carlo stochastic simulations (P10/P50/P90)
- Monthly ARR progression vs targets
- Pipeline stage velocity & conversion matrix
- Saved scenario comparison & executive charts
- Per-stage win rate probability editor

### **Multi-Language Support (I18n)**
- Dynamic language creation with RTL/LTR auto-detection
- Translation key management
- Bulk translation editing
- Full UI localization (Urdu, Arabic, Spanish, etc.)

### **No-Code Custom Agent Builder**
- Visual agent creator interface
- Configurable prompts, triggers, toolkits
- Testing playground with live execution
- Agent lifecycle management (active/inactive/draft)


## 🛠️ Tech Stack
**Backend:**
- Python + FastAPI
- PostgreSQL database
- Redis for caching
- FastAPI BackgroundTasks for async

**AI/ML:**
- LangChain for agent orchestration
- Claude/GPT-4 for intelligence
- SmartFallbackLLM for zero-config mode
- Sentiment analysis models

**Frontend:**
- React 19 + TypeScript
- Vite build system
- TailwindCSS
- TanStack Query v5 + Zustand
- Recharts for data visualization
- Real-time updates (WebSocket)

**Integrations:**
- Gmail/Outlook API
- Google Calendar
- WhatsApp Business API
- Voice/Telephony integration
- LinkedIn enrichment
- Slack notifications
- Zapier webhooks

## 📋 Agent Workflows

### Lead Qualification Flow
```
New Lead → Data Enrichment → Scoring → Routing → Auto-Email → CRM Entry
```

### Email Intelligence Flow
```
Incoming Email → Sentiment Analysis → Categorization → Draft Response → Human Review
```

### Deal Management Flow
```
Deal Created → Health Monitoring → Risk Detection → Action Recommendations → Auto-Followup
```

### Customer Success Flow
```
Customer Activity → Health Score → Churn Risk → Retention Trigger → Success Team Alert
```

### Voice Call Intelligence Flow
```
Call Started → Speech Turn Analysis → Objection Detection → Battle-Card → Post-Call Summary → CRM Sync
```

### WhatsApp Conversational Flow
```
Inbound Message → Intent Classification → Auto-Pilot Reply → Tag & Archive → Sales Handoff
```

### Revenue Forecasting Flow
```
Active Deals → Monte Carlo Simulation → P10/P50/P90 Bounds → ARR Trend → Scenario Save
```

## 🎨 UI Components

- **Dashboard** - Real-time metrics & agent activity
- **Contacts** - Enriched contact profiles
- **Deals** - Visual pipeline with AI insights
- **Inbox** - Smart email management
- **Calendar** - AI-scheduled meetings
- **Analytics** - Predictive insights
- **Voice AI** - Call intelligence studio & transcript viewer
- **WhatsApp** - Omnichannel chat hub with AI auto-pilot
- **Forecasting** - Monte Carlo simulation & ARR trends
- **Custom Agents** - No-code agent builder & test playground
- **Multi-Language** - Translation manager & RTL/LTR sync
- **Settings** - Agent configuration

## 📊 Key Metrics

- Lead-to-customer conversion rate
- Average deal cycle time
- Customer lifetime value
- Churn prediction accuracy
- Email response time
- Agent automation rate
- Revenue forecast accuracy (P10/P50/P90)
- Voice call buyer intent scores
- WhatsApp auto-pilot resolution rate
- Pipeline stage velocity

## 🔐 Security

- End-to-end encryption
- Role-based access control
- API authentication (JWT)
- Audit logging
- Data privacy compliance (GDPR)


# Start frontend
cd frontend && npm run dev
```

## 🔄 Agent Communication

Agents communicate via:
- **Redis Event Bus** (pub/sub)
- **Shared State** (Redis caching)
- **WebSocket Stream** (`/ws` real-time telemetry)
- **API Calls** (RESTful)

## 📈 Scaling

- Horizontal scaling with Docker/Kubernetes
- Load balancing for API
- Database read replicas
- Async task distribution
- CDN for static assets

## 🎯 Use Cases

1. **SaaS Companies** - Automate customer onboarding
2. **Sales Teams** - Intelligent lead qualification
3. **Customer Success** - Proactive churn prevention
4. **Account Executives** - Smart deal tracking
5. **Marketing** - Lead nurturing automation
6. **Call Centers** - Voice AI call coaching & analytics
7. **Omnichannel Support** - WhatsApp business automation
8. **Finance/RevOps** - Monte Carlo revenue forecasting

## 🔮 Future Features

- [x] Voice AI for calls
- [x] WhatsApp integration
- [x] Advanced forecasting
- [x] Multi-language support
- [x] Custom agent builder (no-code)
- [ ] Mobile app (React Native)