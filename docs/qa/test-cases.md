# 🧪 System Test Cases & Verification Matrix

This matrix documents the automated test cases across all modules and agents of the AI-Powered CRM system.

---

## 📊 Summary Test Matrix

| Test Module | File Location | Test Count | Scope |
|---|---|---|---|
| **Voice AI & WhatsApp & Forecasting** | `tests/test_future_features.py` | 11 | Full CRUD, speech turn analysis, auto-pilot, Monte Carlo, velocity matrix |
| **API Edge Cases & Boundaries** | `tests/test_api_edge_cases.py` | 17 | 404 handling, 422 validations, boundary conditions, query filters |
| **Security & Injection** | `tests/test_security_validation.py` | 7 | SQLi search resistance, XSS storage, 422 error structures |
| **Agent Resilience & Edge Cases** | `tests/test_agent_edge_cases.py` | 5 | Score regex parsing, churn risk parsing, sentiment bounds, fallback replies |
| **Multi-Language (I18n)** | `tests/test_languages.py` | 10 | Language CRUD, fallback translations, export/import, RTL synchronization |
| **Custom Agents Builder** | `tests/test_custom_agents.py` | 5 | Custom agent CRUD, dynamic tool interpolation, test execution |
| **Core CRM Routers** | `tests/test_api_routers.py` | 13 | Leads, deals, customers, emails, meetings, analytics |
| **WebSocket Realtime** | `tests/test_websocket_stream.py` | 2 | Connection lifecycle, ping, event broadcasting |
| **Lead Qualification Agent** | `tests/test_lead_agent.py` | 3 | High-value lead routing, low-value score, Pydantic tracing |
| **Customer Success Agent** | `tests/test_customer_agent.py` | 1 | Churn monitoring, health scoring |
| **Sales Pipeline Agent** | `tests/test_deal_agent.py` | 1 | Deal health calculation, stalled deal detection |
| **Email Intelligence Agent** | `tests/test_email_agent.py` | 1 | Sentiment classification, draft responses |
| **Meeting Scheduler Agent** | `tests/test_meeting_agent.py` | 1 | Prep notes generation, schedule coordination |
| **Analytics Agent** | `tests/test_analytics_agent.py` | 1 | Executive dashboard synthesis |
| **Trace Mixin & Event Bus** | `tests/test_trace_mixin.py` | 3 | Realtime LLM tracing events |
| **Frontend UI & Common Components** | `frontend/src/components/**/__tests__/*` | 15 | Button, Card, Badge, StatCard, EmptyState, StatusIndicator, LoadingSpinner |
| **Frontend Utilities & Helpers** | `frontend/src/lib/__tests__/utils.test.ts` | 8 | Currency formatting, score thresholds, status badge styling, classnames merge |
| **Frontend Zustand Stores** | `frontend/src/stores/__tests__/use-ui-store.test.ts` | 5 | Page transitions, search state, sidebar toggling, modal state management |

---

## 🔍 Detailed Test Case Specifications

### 1. Voice AI Intelligence
* `test_list_voice_calls`: List all calls and verify structure (`contact_name`, `buyer_intent_score`).
* `test_create_and_get_voice_call`: Create call record with score 92, verify retrieval.
* `test_analyze_realtime_speech_turn`: Send objection phrase ("too expensive"), verify negative sentiment, objection classification ("Pricing"), and coaching tip.
* `test_create_voice_call_invalid_buyer_intent_bounds`: Send `buyer_intent_score: 150`, verify `422 Unprocessable Entity`.
* `test_create_voice_call_negative_duration`: Send `duration_seconds: -30`, verify `422`.

### 2. WhatsApp Business
* `test_list_whatsapp_conversations`: List threads, verify phone numbers and status.
* `test_send_and_get_whatsapp_messages`: Send message to new phone, verify message history persistence.
* `test_inbound_webhook_with_ai_auto_pilot`: Simulate inbound prospect message, verify `ai_replied: True` and non-empty `agent_reply`.
* `test_toggle_whatsapp_auto_pilot`: Toggle `ai_auto_pilot` between True/False.
* `test_whatsapp_broadcast_empty_recipients`: Send broadcast with empty phone list, verify `422`.

### 3. Advanced Revenue Forecasting
* `test_run_monte_carlo_simulation`: Run 500 iterations, verify `p10 <= p50 <= p90` and 10-point distribution curve.
* `test_get_pipeline_velocity_matrix`: Retrieve velocity matrix, verify stage win rates and cycle days.
* `test_save_and_list_simulations`: Save scenario "Q3 Executive Base Case", verify persistence and listing.
* `test_monte_carlo_invalid_simulation_count`: Send negative simulation count, verify `422`.

### 4. Security & Error Handling
* `test_sql_injection_in_search_leads`: Query with `'; DROP TABLE contacts; --`, verify clean search and intact table.
* `test_xss_in_whatsapp_message_body`: Send `<script>alert('XSS')</script>`, verify saved as literal string.
* `test_invalid_route_returns_clean_404`: Request non-existent endpoint, verify structured 404 JSON.
