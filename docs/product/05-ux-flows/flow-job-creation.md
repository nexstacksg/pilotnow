# UX Flow — Job Creation via WhatsApp

| Field | Value |
|-------|-------|
| **Screen** | WhatsApp Conversation — Job Creation |
| **URL** | N/A (WhatsApp chat) |
| **PRD Ref** | Feature 1: LLM Job Parsing |
| **Access** | Admin / Ops Manager |
| **Date** | 2026-02-23 |

---

## Purpose

Admin creates a new security job by sending natural language text via WhatsApp. The LLM parses the message into structured job data. Admin reviews and confirms before the job is created in the system.

## Entry Points

- Admin sends a WhatsApp message to the PilotNow bot number
- No menu or command needed — any message containing job-like details triggers parsing

## Conversation Flow

### Step 1: Admin Sends Job Details (Free-Form)

**Admin message (example):**
```
Need 2 officers at Mapletree Business City Tower A tomorrow 8am to 6pm. Must have valid security license. Contact person Sarah Tan 91234567.
```

### Step 2: Bot Parses & Presents Confirmation

**Bot reply:**
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
| ✏️ Edit | Bot asks what to change |
| ❌ Cancel | Discards the job |

### Step 3a: Admin Confirms

**Admin taps:** ✅ Confirm

**Bot reply:**
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

**Bot reply:**
```
What would you like to change? Just tell me, e.g.:
- "Change time to 9am-5pm"
- "Need 3 officers instead"
- "Add site: VivoCity"
```

Admin sends correction in natural language. Bot re-parses, shows updated summary (back to Step 2).

### Step 3c: Admin Cancels

**Admin taps:** ❌ Cancel

**Bot reply:**
```
❌ Job creation cancelled. No worries — just send me new job details anytime.
```

## Interactive Elements

| Element | Type | Action |
|---------|------|--------|
| Free-form text | WhatsApp message | Triggers LLM parsing |
| ✅ Confirm | WhatsApp button | Creates job in system |
| ✏️ Edit | WhatsApp button | Re-enters edit loop |
| ❌ Cancel | WhatsApp button | Discards draft job |
| 👤 Assign Officers | WhatsApp button | Transitions to assignment flow |
| ⏭️ Assign Later | WhatsApp button | Ends flow, job saved as unassigned |

## States

### Parsing Success
- Bot presents structured summary with confirmation buttons (Step 2)

### Parsing Ambiguous / Incomplete
**Bot reply:**
```
I got most of the details but need a few more:

📍 Site: Mapletree Business City Tower A
📅 Date: Mon, 24 Feb 2026
⏰ Shift: ❓ What time?
👥 Officers: ❓ How many?

Please reply with the missing info.
```

Bot asks follow-up questions for missing required fields (site, date, time, officer count). Admin replies naturally.

### Parsing Failure
**Bot reply:**
```
🤔 Sorry, I couldn't understand that as a job request. 

Try something like:
"2 officers at Jurong Point tomorrow 8am-6pm"

Or send the details and I'll try again.
```

### Duplicate Detection
**Bot reply:**
```
⚠️ This looks similar to an existing job:

Job #1038 — Mapletree Business City Tower A
📅 Mon, 24 Feb · 08:00–18:00 · 2 officers

Create anyway?
```

**Buttons:** ✅ Create New | ❌ Cancel

### System Error
**Bot reply:**
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
    ├─→ LLM parse incomplete → Follow-up questions → Confirmation summary
    │
    └─→ LLM parse failure → Error + example → Retry
```

## Timeout Behaviour

| Scenario | Timeout | Action |
|----------|---------|--------|
| Confirmation pending (no button tap) | 30 minutes | Bot sends reminder: "Still want to create this job?" |
| No response after reminder | 2 hours | Draft discarded, bot notifies: "Job draft expired." |
| Edit loop idle | 15 minutes | Bot: "Still editing? Send changes or tap Cancel." |

---

**Created by:** Aira · 2026-02-23
