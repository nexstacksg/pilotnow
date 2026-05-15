# UX Flow — Job Creation

| Field | Value |
|-------|-------|
| **Screen** | Job Creation — Admin Intake Flow |
| **URL** | Web app intake + WhatsApp-supported intake |
| **PRD Ref** | See PRD v2.0 |
| **Access** | Admin / Ops Manager |
| **Date** | 2026-02-23 |

---

## Purpose

Admin creates a new security job using PilotNow intake. The flow preserves natural-language WhatsApp intake, while also supporting equivalent admin actions from the web application. The LLM parses the message into structured job data. Admin reviews and confirms before the job is created in the system.

The same intake capability also supports a customer-facing WhatsApp order flow where the AI acknowledges the order, creates a draft job, and hands the request into fulfilment.

## Entry Points

- Admin starts job creation from WhatsApp intake or the web application intake flow
- No rigid menu or command needed — any message containing job-like details can trigger parsing, and equivalent admin web intake is also supported

## Conversation Flow

### Step 1: Admin Sends Job Details (Free-Form)

**Admin message (example):**
```
Need 2 officers at Mapletree Business City Tower A tomorrow 8am to 6pm. Must have valid security license. Contact person Sarah Tan 91234567.
```

### Step 2: System Parses & Presents Confirmation

**System reply:**
```
📋 New Job Summary

📍 Site: Mapletree Business City Tower A
📅 Date: Mon, 24 Feb 2026
⏰ Shift: 08:00 – 18:00 (10 hrs)
👥 Officers needed: 2
📝 Requirements: Valid security license
👤 Site contact: Sarah Tan (91234567)

Please confirm:
```

**Buttons:**
| Button | Action |
|--------|--------|
| ✅ Confirm | Creates the job |
| ✏️ Edit | System asks what to change |
| ❌ Cancel | Discards the job |

### Step 2b: Customer-Originated Intake Variant

**Customer message (example):**
```
Need 2 officers tomorrow 8am-6pm at ABC Mall, Gate 2
```

**System reply:**
```
✅ Got it — processing your request now.

I found:
📍 Site: ABC Mall, Gate 2
📅 Date: Tue, 26 May 2026
⏰ Shift: 08:00 – 18:00
👥 Officers needed: 2

I’m now checking availability and will update you once coverage is secured.
```

If key fields are missing, the AI asks clarifying questions before fulfilment continues.

### Step 3a: Admin Confirms

**Admin taps:** ✅ Confirm

**System reply:**
```
✅ Job #1042 created!

📍 Mapletree Business City Tower A
📅 Mon, 24 Feb 2026 · 08:00–18:00
👥 2 officers needed

Ready to assign officers? Send officer names or tap below:
```

**Buttons:**
| Button | Action |
|--------|--------|
| 👤 Assign Officers | Moves to assignment flow |
| ⏭️ Assign Later | Ends conversation |

### Step 3b: Admin Edits

**Admin taps:** ✏️ Edit

**System reply:**
```
What would you like to change? Just tell me, e.g.:
- "Change time to 9am-5pm"
- "Need 3 officers instead"
- "Add site: VivoCity"
```

Admin sends correction in natural language. System re-parses, shows updated summary (back to Step 2).

### Step 3c: Admin Cancels

**Admin taps:** ❌ Cancel

**System reply:**
```
❌ Job creation cancelled. No worries — just send me new job details anytime.
```

## Interactive Elements

| Element | Type | Action |
|---------|------|--------|
| Free-form text | WhatsApp message / web intake text | Triggers LLM parsing |
| ✅ Confirm | Chat action / web action | Creates job in system |
| ✏️ Edit | Chat action / web action | Re-enters edit loop |
| ❌ Cancel | Chat action / web action | Discards draft job |
| 👤 Assign Officers | Chat action / web action | Transitions to assignment flow |
| ⏭️ Assign Later | Chat action / web action | Ends flow, job saved as unassigned |

## States

### Parsing Success
- System presents structured summary with confirmation actions (Step 2)

### Parsing Ambiguous / Incomplete
**System reply:**
```
I got most of the details but need a few more:

📍 Site: Mapletree Business City Tower A
📅 Date: Mon, 24 Feb 2026
⏰ Shift: ❓ What time?
👥 Officers: ❓ How many?

Please reply with the missing info.
```

System asks follow-up questions for missing required fields (site, date, time, officer count). Admin replies naturally or updates via the web application.

### Parsing Failure
**System reply:**
```
🤔 Sorry, I couldn't understand that as a job request. 

Try something like:
"2 officers at Jurong Point tomorrow 8am-6pm"

Or send the details and I'll try again.
```

### Duplicate Detection
**System reply:**
```
⚠️ This looks similar to an existing job:

Job #1038 — Mapletree Business City Tower A
📅 Mon, 24 Feb · 08:00–18:00 · 2 officers

Create anyway?
```

**Buttons:** ✅ Create New | ❌ Cancel

### System Error
**System reply:**
```
⚠️ Something went wrong saving the job. Please try again in a moment.
```

Auto-retry once after 5 seconds. If still failing, admin is asked to try again.

## Navigation Map

```
Admin free-form message
    │
    ├─→ LLM parse success → Confirmation summary
    │       ├─→ ✅ Confirm → Job created → Assign officers flow
    │       ├─→ ✏️ Edit → Correction loop → Re-confirmation
    │       └─→ ❌ Cancel → End
    │
    ├─→ Customer intake success → Draft job created → Fulfilment / assignment flow
    │
    ├─→ LLM parse incomplete → Follow-up questions → Confirmation summary
    │
    └─→ LLM parse failure → Error + example → Retry
```

## Timeout Behaviour

| Scenario | Timeout | Action |
|----------|---------|--------|
| Confirmation pending (no button tap) | 30 minutes | System sends reminder: "Still want to create this job?" |
| No response after reminder | 2 hours | Draft discarded, system notifies: "Job draft expired." |
| Edit loop idle | 15 minutes | System: "Still editing? Send changes or tap Cancel." |

---

**Created by:** Aira · 2026-02-23
