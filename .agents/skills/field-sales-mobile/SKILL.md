---
name: field-sales-mobile
description: Guide for developing, extending, and maintaining the React Native Expo Field Sales Mobile App for AI-Powered CRM.
---

# Field Sales Mobile Application Development Skill

This skill defines the technical standards, file-based routing conventions, offline data flow, dynamic custom fields integration, and audio intelligence architecture for the `mobile/` React Native Expo application.

---

## 🏗️ Architecture & Technology Stack

- **Framework**: Expo SDK 57 + React Native 0.86 with React 19
- **Navigation**: Expo Router (file-based routing in `src/app/` across 20 static routes)
- **State Management**: Zustand stores in `src/stores/` (`authStore`, `dealsStore`, `leadsStore`, `customerStore`, `voiceNotesStore`, `notificationStore`, `workflowStore`)
- **Persistence & Offline Queue**: `@react-native-async-storage/async-storage` via `src/services/offlineStorage.ts`
- **Networking**: Centralized Axios API client with automatic JWT token attachment, refresh interceptor, environment parsing, and dual-layer offline persistence in `src/services/api.ts`
- **Iconography & Haptics**: `lucide-react-native`, `expo-haptics`, `react-native-svg`
- **Design System**: Tactical Command Mobile Tokens (`#0B0C10` Void Black, `#FFB800` Tactical Gold, `#00FF9D` Emerald, `#FF2A54` Alert Red, Monospace metrics)
- **Containerization**: Multi-stage Docker build with Bun builder and Nginx static distribution server (`mobile/Dockerfile`)

---

## 📱 Navigation & Routing Guidelines

Routes are located inside `mobile/src/app/`:

1. `(tabs)/_layout.tsx`: Bottom tab navigator with badges for notifications.
2. `(tabs)/index.tsx`: **Tactical Field Command Dashboard** (Pipeline KPI stats, urgent deals, voice note CTA, and online/offline sync status).
3. `(tabs)/deals.tsx`: **Deals & Pipeline Intelligence** (Stage tabs: Discovery, Qualified, Proposal, Negotiation, Won, interactive `+ NEW DEAL` modal, and search filtering).
4. `(tabs)/activities.tsx`: **Voice Notes & Activity Logging** (Captured debriefs, buyer intent scores, audio playback bar, extracted action item checklists).
5. `(tabs)/workflows.tsx`: **Mobile Workflow Trigger Studio** (Multi-agent trigger execution logs, full CRUD, and 1-click test simulation).
6. `(tabs)/notifications.tsx`: **Real-Time Notification Center** (Lead alerts, deal risk radar, and unread triage).
7. `leads/index.tsx`: **Leads & BANT Radar** (BANT scoring, WhatsApp template auto-pilot, and 1-click Convert to Deal).
8. `customers/index.tsx`: **Customer 360 & Churn Radar** (MRR/ARR metrics, churn risk radar, and 1-click retention playbooks).
9. `deals/[id].tsx`: **Deal Details & Dynamic Custom Fields** (AI health score radar, stage progression, and dynamic field editor).
10. `voice/record.tsx`: **Dedicated Voice Note Recording Studio** (Pulsing waveform visualizer, recording timer, entity association, and AI summary preview).
11. `settings/profile.tsx`: **User Profile & Diagnostics Studio** (RBAC telemetry, API gateway diagnostics, offline cache manager, and secure sign out).
12. `(auth)/login.tsx`: **Tactical Login Screen** (Email, password, role presets).

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
- `select`: Modal picker for selecting predefined options.
- `boolean`: Native tactile Switch toggle.
- `date`: Formatted date string input.

---

## 🎙️ Voice Notes & Audio Intelligence Pipeline

1. **Recording State**: Tracked in `useVoiceNotesStore` with live MM:SS counter and waveform animation.
2. **AI Post-Processing**: Generates an executive summary, sentiment, buyer intent score (0–100%), and action items.
3. **CRM Attachment**: Associates the note with the target `deal_id` or `contact_id`.
4. **Offline Queueing**: If offline, the note is saved locally with `is_synced: false` and queued for background upload.

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
