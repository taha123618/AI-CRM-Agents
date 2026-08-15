# Multi-Language & Internationalization (i18n) Documentation

Welcome to the production-grade **Multi-Language (i18n) and Localization (L10n)** engine of the AI-Powered CRM.

---

## 🌟 Key Architecture & Capabilities

1. **8 Supported Core Languages & Dynamic Custom Additions**:
   - 🇺🇸 English (`en`) - *Default LTR*
   - 🇪🇸 Spanish (`es`) - *LTR*
   - 🇫🇷 French (`fr`) - *LTR*
   - 🇩🇪 German (`de`) - *LTR*
   - 🇸🇦 Arabic (`ar`) - *RTL*
   - 🇵🇰 Urdu (`ur`) - *RTL*
   - 🇯🇵 Japanese (`ja`) - *LTR*
   - 🇨🇳 Chinese Simplified (`zh`) - *LTR*

2. **Automatic RTL/LTR Text Direction**:
   - Switching to Arabic or Urdu immediately triggers `dir="rtl"` on `document.documentElement` and applies CSS logical property alignment across all navigation bars, modals, tables, KPI grids, and charts.

3. **Deterministic Fallback Resolution**:
   - `Requested Language` ➔ `Default Language (en)` ➔ `Master Constant Bundle` ➔ `Key String`.
   - Never crashes or shows undefined text if an individual translation key is missing.

4. **In-Memory & Redis-Compatible Caching**:
   - Zero-latency in-memory dictionary lookup per language/namespace.
   - Cache invalidation upon translation edits, single-key upserts, JSON bulk imports, or language metadata changes.

5. **Administrative Management UI**:
   - **Language Console**: Create new languages, enable/disable, set system defaults, and manage emoji flags.
   - **Translation Editor**: Interactive namespace filter, live editing, fallback comparisons, JSON export & import.
   - **Audit Logs**: Comprehensive tracking of created, modified, deleted, and imported translation strings.

6. **Locale-Aware Formatting Utilities**:
   - `useLocaleFormat()`: Formats currency (`Intl.NumberFormat`), timestamps (`Intl.DateTimeFormat`), and numbers adhering to active locale conventions.
   - `useTranslation()`: Centralized `t(key, params)` and `tPlural(key, count, params)` hooks with variable interpolation (`{name}`, `{count}`).

---

## 🚀 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/languages` | List all configured languages (optional `enabled_only=true` filter) |
| `POST` | `/api/languages` | Create a new language with auto-seeded preset translations |
| `GET` | `/api/languages/{code}` | Get single language metadata |
| `PUT` | `/api/languages/{code}` | Update language name, direction, enabled, or default status |
| `DELETE` | `/api/languages/{code}` | Delete language and associated translation records |
| `GET` | `/api/languages/namespaces` | List all unique translation namespaces |
| `GET` | `/api/languages/audits` | Query administrative modification audit logs |
| `GET` | `/api/languages/preferences/me` | Fetch user localization preference |
| `PUT` | `/api/languages/preferences/me` | Update user localization preference |
| `GET` | `/api/languages/{code}/translations` | Fetch translations bundle with fallback |
| `PUT` | `/api/languages/{code}/translations/{ns}/{key}` | Upsert single translation key |
| `DELETE` | `/api/languages/{code}/translations/{ns}/{key}` | Delete single translation key |
| `POST` | `/api/languages/{code}/translations` | Bulk upsert translations dictionary |
| `GET` | `/api/languages/{code}/export` | Export language JSON package |
| `POST` | `/api/languages/{code}/import` | Import language JSON package |
| `GET` | `/api/i18n/{locale}` | Optimized runtime endpoint for all namespaces |
| `GET` | `/api/i18n/{locale}/{ns}` | Optimized runtime endpoint for specific namespace |
