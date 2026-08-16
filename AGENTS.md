# PROJECT & GLOBAL ENGINEERING RULES — RESUMEAI PRO

This project operates under the **ANTIGRAVITY GLOBAL ENGINEERING OS**.

## 1. Global Operating System Reference
- **Global Rules Location**: `~/.gemini/config/plugins/antigravity-global-engineering-os/rules/ANTIGRAVITY_GLOBAL_ENGINEERING_OS.md`
- **Global Skill & Specialist Catalog**: `global-engineering-os` (referencing `awesome-claude-code-subagents`)

## 2. Core Operational Protocols
- **Understand & Inspect First**: Never modify code blindly. Always inspect directory structure, dependencies, APIs, and state flow before editing.
- **Preserve Verified Architecture**: `SOURCE_CV_MASTER`, `CURRENT_CV_STATE`, `versionHistory`, `LockEnforcer`, `verifyRequestedChange`, and multi-turn state accumulators are immutable baseline protections.
- **Security & Privacy First**: Zero private API keys in frontend client bundles; Vercel serverless dual-provider routing (`api/cv/update.js`); strict XSS escaping and prompt injection guards.
- **Fact Provenance**: Strict anti-hallucination fact locking. Never invent companies, dates, metrics, awards, or unrequested skills.
- **Empirical Cross-Browser Verification**: Always run Playwright tests across Chromium, Firefox, and WebKit before declaring completion.
- **Honest Status Reporting**: Absolute adherence to status categories: `PASS`, `NOT TESTED`, `NOT VERIFIED`, `BLOCKED`, `NOT IMPLEMENTED`, `FAILED`.
