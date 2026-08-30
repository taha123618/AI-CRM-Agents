---
name: field-sales-mobile
description: Guide for developing, extending, and maintaining the React Native Expo Field Sales Mobile App for AI-Powered CRM.
---

# Field Sales Mobile Application Development Skill

This skill defines the technical standards, file-based routing conventions, offline data flow, dynamic custom fields integration, and audio intelligence architecture for the `mobile/` React Native Expo application.

---

## 🏗️ Architecture & Technology Stack

- **Framework**: Expo SDK 57 + React Native 0.86 with React 19
- **Navigation**: Expo Router (file-based routing in `src/app/` across 78 static routes)
- **High-Performance Virtualization**: `@shopify/flash-list` v2 for 60-120 FPS cell recycling across all entity lists (`TacticalFlashList`)
- **Universal Voice Engine**: Platform-split audio synthesis (`voicePlaybackService.web.ts` using Web Speech API and `voicePlaybackService.native.ts` bridging `expo-speech`)
- **State Management**: Zustand stores in `src/stores/` (`authStore`, `dealsStore`, `leadsStore`, `customerStore`, `voiceNotesStore`, `notificationStore`, `workflowStore`, `themeStore`, `sidebarStore`)
- **Persistence & Offline Queue**: `@react-native-async-storage/async-storage` via `src/services/offlineStorage.ts`
- **Networking**: Centralized Axios API client with automatic JWT token attachment, refresh interceptor, environment parsing, and dual-layer offline persistence in `src/services/api.ts`
- **Iconography & Haptics**: `lucide-react-native`, `expo-haptics`, `react-native-svg`
- **Design System**: Tactical Command Mobile Tokens (`#0B0C10` Void Black / Dark, `#F8FAFC` Light Mode, `#FFB800` Tactical Gold, `#00FF9D` Emerald, `#FF2A54` Alert Red, Monospace metrics)
- **Containerization**: Multi-stage Docker build with Bun builder and Nginx static distribution server (`mobile/Dockerfile`)

---

## 📱 Navigation & Routing Guidelines

Routes are located inside `mobile/src/app/`:

1. `(tabs)/_layout.tsx`: Persistent Bottom Tab Navigator hosting 5 primary tabs (`Dashboard`, `Deals`, `AI Studios`, `Voice Notes`, `Alerts`) and 13 in-tab feature screens.
2. `(tabs)/index.tsx`: **Tactical Field Command Dashboard** (Pipeline KPI stats, urgent deals, voice note CTA, specialized studios quick launcher matrix, theme toggle, and online/offline sync status).
3. `(tabs)/deals.tsx`: **Deals & Pipeline Intelligence** (Powered by `FlashList`, stage tabs: Discovery, Qualified, Proposal, Negotiation, Won, interactive `+ NEW DEAL` modal, and search filtering).
4. `(tabs)/studios.tsx`: **AI Command Studios & Feature Modules Hub** (Category filtering, search, and 1-tap switching across all 17 feature studios).
5. `(tabs)/activities.tsx`: **Voice Notes & Activity Logging** (Powered by `FlashList`, captured debriefs, buyer intent scores, audio playback bar, extracted action item checklists).
6. `(tabs)/workflows.tsx`: **Mobile Workflow Trigger Studio** (Powered by `FlashList`, multi-agent trigger execution logs, full CRUD, and 1-click test simulation).
7. `(tabs)/notifications.tsx`: **Real-Time Notification Center** (Powered by `FlashList`, lead alerts, deal risk radar, and unread triage).
8. `(tabs)/leads.tsx` & `leads/index.tsx`: **Leads & BANT Radar** (Powered by `FlashList`, BANT scoring, WhatsApp template auto-pilot, and 1-click Convert to Deal).
9. `(tabs)/customers.tsx` & `customers/index.tsx`: **Customer 360 & Churn Radar** (Powered by `FlashList`, MRR/ARR metrics, churn risk radar, and 1-click retention playbooks).
10. `(tabs)/war-room.tsx` & `war-room/index.tsx`: **AI Deal War Room & Strategy Studio** (Multi-agent consensus verdicts, SWOT quadrant, competitor battlecards, and 1-click smart proposals).
11. `(tabs)/forecasting.tsx` & `forecasting/index.tsx`: **Stochastic Monte Carlo Revenue Forecasting** (P10/P50/P90 confidence bounds, stage velocity & hazard conversion matrix).
12. `(tabs)/journey.tsx` & `journey/index.tsx`: **Autonomous Customer Journey & Churn Prevention** (Telemetry-guided lifecycle pipeline, ARR aggregation, and 1-click autonomous retention playbooks).
13. `(tabs)/sequences.tsx` & `sequences/index.tsx`: **AI SDR Multi-Touch Cadences** (Omnichannel cadences across Email, WhatsApp, Voice AI with 1-click lead cohort enrollment).
14. `(tabs)/voice-ai.tsx` & `voice-ai/index.tsx`: **Voice AI Call Intelligence Studio** (Real-time speech intent scoring, dynamic objection battlecards with audio playback, and post-call CRM synthesis).
15. `(tabs)/whatsapp.tsx` & `whatsapp/index.tsx`: **WhatsApp Multi-Agent Hub** (24/7 AI Auto-Pilot chat, manual operator override, broadcast campaigns).
16. `(tabs)/emails.tsx` & `emails/index.tsx`: **Autonomous Email Intelligence Studio** (RFC-5321 synthesized inbox, AI outbound draft composer, resilient task queue delivery).
17. `(tabs)/analytics.tsx` & `analytics/index.tsx`: **Executive Analytics & Velocity Radar** (Fleet win rate, avg cycle days, daily ARR velocity, and top operator leaderboards).
18. `(tabs)/agents.tsx` & `agents/index.tsx`: **AI Agents Swarm Fleet Monitor** (Real-time status of 9 specialized BaseAgents, tasks completed counters, and swarm pulse trigger).
19. `(tabs)/meetings.tsx` & `meetings/index.tsx`: **AI Meeting Scheduler & Briefing Studio** (Upcoming sessions timeline, acceptance metrics, and 1-click participant briefing dossiers).
20. `(tabs)/custom-agents.tsx` & `custom-agents/index.tsx`: **No-Code Custom Agent Builder** (Visual custom agent provisioning, trigger bindings, prompt instructions, and tool assignments).
21. `(tabs)/multi-language.tsx` & `multi-language/index.tsx`: **Multi-Language & Localization Studio** (8 locale switchers, RTL/LTR layout synchronization, dynamic LLM translation cache).
22. `(tabs)/reports.tsx` & `reports/index.tsx`: **Executive Reports & Export Studio** (Deals, Leads, Voice Intelligence, Audit Logs with formula injection sanitization).
23. `(tabs)/settings.tsx` & `settings/index.tsx`: **Platform Governance, RBAC Users & Webhooks Hub** (User management, server metrics, outbound webhooks, and forensic audits).
24. `settings/profile.tsx`: **User Profile & Diagnostics Studio** (RBAC telemetry, API gateway diagnostics, offline cache manager, and secure sign out).
25. `(tabs)/explore.tsx` & `explore.tsx`: **SaaS Fleet Showcase & ROI Calculator** (Capability overview, architecture specifications, and interactive ROI model).
26. `voice/record.tsx`: **Live Microphone Speech Recognition Studio** (Real-time speech-to-text transcript capture, editable title/transcript/summary/action items, entity association, and debrief audio playback).
27. `deals/[id].tsx`: **Deal Details & Dynamic Custom Fields** (AI health score radar, stage progression, and dynamic field editor).
28. `(auth)/login.tsx`: **Tactical Login Screen** (Email, password with Eye/EyeOff visibility toggle, SSO shortcuts, role presets).
29. `(auth)/register.tsx`: **Operator Provisioning Screen** (Full name, email, Eye/EyeOff password toggle, live password match validator, password strength meter, RBAC role assignment, routes to OTP verification).
30. `(auth)/verify-otp.tsx`: **2-Factor Authentication Screen** (6-digit cells with auto-advance, backspace navigation, clipboard paste support, 2-minute countdown timer, 1-click resend, and session activation).
31. `(auth)/forgot-password.tsx`: **Credential Recovery Screen** (Zero-enumeration reset token dispatch).
32. `(auth)/reset-password.tsx`: **Password Overwrite Screen** (Single-use SHA-256 token verification & new password complexity validation).
33. `(auth)/verify-email.tsx`: **Identity Verification Screen** (Mailbox confirmation & token validator).
34. `unauthorized.tsx`: **403 Access Restriction Screen** (Insufficient privileges error, operator role telemetry, session termination).

---

## ⚡ High-Performance FlashList Architecture & Zero FlatList Policy

> [!IMPORTANT]
> **Zero `<FlatList>` Policy**: Always use `<FlashList>` from `@shopify/flash-list` (or `<TacticalFlashList>`) for rendering collections, lists, and modal option pickers across all mobile screens. Never import or use React Native's standard `<FlatList>`.

All entity lists use `@shopify/flash-list` for memory recycling and 60-120fps scrolling:

```tsx
import { FlashList } from '@shopify/flash-list';
// or use the reusable wrapper:
import { TacticalFlashList } from '@/components/ui/TacticalFlashList';

<FlashList
  data={deals}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <DealCard deal={item} />}
  contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
  refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchDeals} tintColor={colors.primary} />}
/>
```

---

## ⚡ Dynamic Custom Fields Integration

The mobile application dynamically evaluates and renders custom fields from `/api/custom-fields`:

```tsx
import { DynamicFieldRenderer } from '@/components/dynamic-fields/DynamicFieldRenderer';

// In any detail screen:
<DynamicFieldRenderer
  definitions={customFields}
  initialValues={deal.custom_fields || {}}
  onSave={async (newValues) => {
    await updateDealCustomFields(deal.id, newValues);
  }}
/>
```

Supported field types:
- `text`: Native TextInput with uppercase label and theme borders.
- `number` & `currency`: Monospaced numeric input with currency symbol prefix.
- `select`: High-performance modal option picker powered by `FlashList`.
- `boolean`: Native tactile Switch toggle.
- `date`: Formatted date string input.

---

## 🎙️ Voice Notes & Universal Audio Intelligence Pipeline

1. **Live Speech Recognition**: `mobile/src/app/voice/record.tsx` connects live Web / Native speech recognition to transcribe real spoken voice directly into the note transcript.
2. **Dynamic AI Post-Processing & Custom Fields**: Automatically derives note title, executive summary, buyer intent score (0–100%), and action items while allowing manual operator edits.
3. **Universal Audio Playback**: `VoicePlaybackService.playVoice(text)` dynamically bridges:
   - `voicePlaybackService.web.ts`: Web Speech API `window.speechSynthesis`.
   - `voicePlaybackService.native.ts`: Dynamic Expo Speech bridge on iOS/Android.
4. **CRM Attachment & Local Preservation**: Unsynced local voice notes are preserved at the top of the feed and automatically merged with backend responses.
5. **Offline Queueing**: Notes are saved locally with `is_synced: false` and queued for background upload when online.

---

## 🌓 Dark / Light Theme Toggle System

The mobile application features a persistent theme switcher powered by `themeStore` and `useTheme`:
- **Theme Modes**: `dark` (Void Black `#0B0C10`), `light` (Crisp Tactical `#F8FAFC`), or `system`.
- **Global Inversion**: Immediate visual contrast adaptation across cards, borders, text, and inputs with zero layout shift.

---

## 🔄 Offline-First Resilience Workflow

- **Reads**: `src/services/api.ts` transparently returns cached data from `OfflineStorage` if network is unavailable or exceeds 15s timeout.
- **Mutations**: Enqueued via `OfflineStorage.enqueueOfflineAction()` with unique IDs.
- **Auto-Sync Hook**: `useOfflineSync()` runs every 30 seconds and processes queued mutations sequentially when network is restored.

---

## 🐳 Docker & Containerization Operations

```bash
# 1. Build mobile production web image
docker build -t ai-crm-mobile:latest ./mobile

# 2. Run mobile standalone container
docker run -d -p 8081:80 --name crm_mobile ai-crm-mobile:latest

# 3. Launch with full production Docker Compose stack
docker-compose up -d --build mobile
```

---

## 🧪 Verification & Type Safety

Always verify Expo environment and TypeScript types after making changes in `mobile/`:

```bash
cd mobile
bunx expo-doctor
npx tsc --noEmit
bunx expo export --platform web
```
